/** @vitest-environment node */

import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { cgroupBytes } from '@/core/metrics';
import { observeRegistry } from './pushMetrics';

const exportOnce = async () => {
  const exporter = new InMemoryMetricExporter(
    AggregationTemporality.CUMULATIVE,
  );
  const provider = new MeterProvider({
    readers: [new PeriodicExportingMetricReader({ exporter })],
  });
  observeRegistry(provider.getMeter('test'));

  await provider.forceFlush();
  const exported = exporter
    .getMetrics()
    .flatMap((resource) => resource.scopeMetrics)
    .flatMap((scope) => scope.metrics);
  await provider.shutdown();

  return new Map(
    exported.map((metric) => [metric.descriptor.name, metric.dataPoints]),
  );
};

describe('observeRegistry', () => {
  test('pushes what the engine reads and leaves the nodejs family to /metrics', async () => {
    const pushed = await exportOnce();
    const names = [...pushed.keys()].sort();

    // prom-client registers this only on Linux, where it can read /proc/self/fd.
    const openFds = process.platform === 'linux' ? ['process_open_fds'] : [];

    expect(names.filter((name) => !name.startsWith('container_'))).toEqual([
      'info',
      'process_cpu_seconds_total',
      ...openFds,
      'process_resident_memory_bytes',
      'start_time_seconds',
    ]);
    // A host with a memory cgroup adds these, and never as a zero
    for (const name of names.filter((name) => name.startsWith('container_'))) {
      expect(pushed.get(name)?.[0]?.value).toBeGreaterThan(0);
    }
  });

  test('info keeps its version and commit, which liveness reads as reporting', async () => {
    const [info] = (await exportOnce()).get('info') ?? [];

    expect(info?.value).toBe(1);
    expect(Object.keys(info?.attributes ?? {}).sort()).toEqual([
      'commit',
      'version',
    ]);
  });

  test('the start time is when this process began', async () => {
    const [startTime] = (await exportOnce()).get('start_time_seconds') ?? [];
    const expected = Date.now() / 1000 - process.uptime();

    expect(startTime?.value).toBeCloseTo(expected, -1);
  });
});

describe('cgroupBytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cgroup-'));
  const file = (name: string, text: string) => {
    const path = join(dir, name);
    writeFileSync(path, text);
    return path;
  };
  const missing = join(dir, 'missing');

  test.each([
    {
      expected: 536870912,
      files: () => [file('v2-number', '536870912\n')],
      when: 'the v2 file holds a number',
    },
    {
      expected: undefined,
      files: () => [file('v2-max', 'max\n'), file('v1-under-max', '1024\n')],
      when: 'the v2 limit is max',
    },
    {
      expected: 2048,
      files: () => [missing, file('v1-number', '2048\n')],
      when: 'only the v1 file exists',
    },
    {
      expected: undefined,
      files: () => [file('empty', '')],
      when: 'the file is empty',
    },
    { expected: undefined, files: () => [missing], when: 'no file exists' },
  ])('reads $expected when $when', ({ expected, files }) => {
    expect(cgroupBytes(files())).toBe(expected);
  });
});
