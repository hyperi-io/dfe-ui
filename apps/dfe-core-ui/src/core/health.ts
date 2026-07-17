// The DFE probe trinity, for the Node/Next side of the stack.
//
// This is scalo's health contract (scalo-rs docs/core-pillars/HEALTH.md) expressed in
// Next.js, so dfe-ui probes the same way the Rust services do: same paths, same
// bodies, same semantics. Both alias sets are served -- `/healthz|/readyz|/startupz`
// (canonical, what the charts use) and `/health/live|/health/ready|/health/startup`.
//
// | Endpoint             | Semantics            | Fails when            | K8s action        |
// |----------------------|----------------------|-----------------------|-------------------|
// | /healthz, /health/live    | process alive   | never                 | kill + restart    |
// | /startupz, /health/startup| init complete   | until marked started  | wait, then restart|
// | /readyz, /health/ready    | ready for traffic| ready flag cleared   | pull from Service |
//
// The one deviation from the Rust services, and it is forced: they host health on the
// METRICS port (9090) because scalo runs a second HTTP server. Next.js has exactly one
// listener, so these ride :3000. Paths and bodies are unchanged, which is what the
// probes and the operators actually read.
//
// WHY THIS EXISTS: the dfe-ui chart has probed /health/live and /health/ready since it
// was written, and the routes did not exist -- every probe 404'd, so readiness never
// passed and liveness restarted the pod forever (392 restarts on the devex cluster).
// That also jammed `dfe-ops verify`, whose gate is all-pods-Ready, and so blocked the
// default E2E acceptance for the whole deploy.

export type HealthBody = { status: string };

const OK = 200;
const UNAVAILABLE = 503;

// Next may keep a warm module across requests, so this survives as process state.
let started = false;
let ready = true;

/** Flip /startupz to 200. Call once init is genuinely complete. */
export function markStarted(): void {
  started = true;
}

/** Clear readiness so K8s pulls this pod from the Service (e.g. on SIGTERM drain). */
export function setReady(value: boolean): void {
  ready = value;
}

/**
 * Liveness: alive, and NOTHING else.
 *
 * Never checks a downstream dependency. Mixing liveness with dependency checks is the
 * classic cascading-restart-loop bug: when the API goes down, restarting every UI
 * replica makes recovery slower, not faster. Liveness exists to catch a deadlocked
 * process -- if it can answer, it is alive.
 */
export function liveness(): Response {
  return Response.json({ status: 'alive' } satisfies HealthBody, {
    status: OK,
  });
}

/**
 * Startup: has init finished?
 *
 * A Next server that is answering has booted, so this reports started once the module
 * is warm. It stays a distinct endpoint so the chart keeps its long boot budget
 * separate from the liveness period -- a slow start must not read as a dead process.
 */
export function startup(): Response {
  if (!started) markStarted();
  return Response.json({ status: 'started' } satisfies HealthBody, {
    status: OK,
  });
}

/**
 * Readiness: should this pod take traffic?
 *
 * Deliberately does NOT probe the engine API. The UI proxies per request and must
 * still serve the login page and its own error states when the API is down; gating on
 * the API would pull every UI pod from the Service the moment the API blipped, turning
 * one degraded backend into a total outage -- and would deadlock a cold start where UI
 * and API come up together.
 */
export function readiness(): Response {
  if (!ready) {
    return Response.json({ status: 'not_ready' } satisfies HealthBody, {
      status: UNAVAILABLE,
    });
  }
  return Response.json({ status: 'ready' } satisfies HealthBody, {
    status: OK,
  });
}
