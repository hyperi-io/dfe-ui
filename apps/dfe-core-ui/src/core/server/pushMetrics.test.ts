/** @vitest-environment node */

import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { describe, expect, test } from 'vitest';
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

    expect([...pushed.keys()].sort()).toEqual([
      'info',
      'process_cpu_seconds_total',
      'process_open_fds',
      'process_resident_memory_bytes',
      'start_time_seconds',
    ]);
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
