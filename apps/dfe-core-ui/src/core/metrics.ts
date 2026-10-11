import { collectDefaultMetrics, Gauge, Registry } from '@prometheus-io/client';

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

  return registry;
}

export function getRegistry(): Registry {
  globalForMetrics.dfeRegistry ??= buildRegistry();
  return globalForMetrics.dfeRegistry;
}
