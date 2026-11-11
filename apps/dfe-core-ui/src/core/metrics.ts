import { readFileSync } from 'node:fs';
import { collectDefaultMetrics, Gauge, Registry } from '@prometheus-io/client';

// The cgroup v2 file first, then v1, as scalo reads them
const MEMORY_USAGE_FILES = [
  '/sys/fs/cgroup/memory.current',
  '/sys/fs/cgroup/memory/memory.usage_in_bytes',
];
const MEMORY_LIMIT_FILES = [
  '/sys/fs/cgroup/memory.max',
  '/sys/fs/cgroup/memory/memory.limit_in_bytes',
];

/** The byte count in the first readable cgroup file, or undefined when none holds a number, as `max` does. */
export function cgroupBytes(files: readonly string[]): number | undefined {
  for (const file of files) {
    let text: string;
    try {
      text = readFileSync(file, 'utf8').trim();
    } catch {
      continue;
    }
    const bytes = Number(text);
    return text !== '' && Number.isFinite(bytes) ? bytes : undefined;
  }
  return undefined;
}

/** A gauge set from the cgroup at every read, left out when this host has no such file, as scalo does. */
function cgroupGauge(
  registry: Registry,
  name: string,
  help: string,
  files: readonly string[],
): void {
  if (cgroupBytes(files) === undefined) return;
  new Gauge({
    name,
    help,
    registers: [registry],
    collect() {
      const bytes = cgroupBytes(files);
      if (bytes !== undefined) this.set(bytes);
    },
  });
}

// Prometheus metrics for the Node side of the stack, deliberately shaped like the
// Rust services' output so one dashboard and one scrape config cover everything.
//
// The client's default collector already emits the same process_* family scalo does
// (process_cpu_seconds_total, process_resident_memory_bytes, process_open_fds,
// process_start_time_seconds), plus the nodejs_* family -- event-loop lag, GC, heap --
// which is the Node equivalent of what the Rust services report about their runtime.
// The `info` gauge is added by hand to match theirs (info{version,commit} 1).
//
// Self-monitoring is one of the two default E2E acceptance tests, and this endpoint is
// the UI's share of it.

// One registry per process. Next keeps this module warm across requests, so the
// default collector must only ever be registered once -- the client throws on a
// duplicate metric name, which would turn /metrics into a 500 on the second request.
const globalForMetrics = globalThis as unknown as { dfeRegistry?: Registry };

function buildRegistry(): Registry {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  new Gauge({
    name: 'info',
    help: 'Application info for service discovery',
    labelNames: ['version', 'commit'],
    registers: [registry],
  }).set(
    {
      // next.config bakes '' when nothing is stamped, so || not ??.
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      commit: process.env.GIT_COMMIT ?? 'unknown',
    },
    1,
  );

  // The name the engine's status page reads for uptime, and scalo-py's app group emits.
  new Gauge({
    name: 'start_time_seconds',
    help: 'Start time of the process since unix epoch in seconds',
    registers: [registry],
  }).set(Date.now() / 1000 - process.uptime());

  // The memory the engine's usage reads, as every scalo app reports it
  cgroupGauge(
    registry,
    'container_memory_usage_bytes',
    'Container memory usage in bytes',
    MEMORY_USAGE_FILES,
  );
  cgroupGauge(
    registry,
    'container_memory_limit_bytes',
    'Container memory limit in bytes',
    MEMORY_LIMIT_FILES,
  );

  return registry;
}

export function getRegistry(): Registry {
  globalForMetrics.dfeRegistry ??= buildRegistry();
  return globalForMetrics.dfeRegistry;
}
