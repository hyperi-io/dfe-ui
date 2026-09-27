// The DFE health probes, for the Node/Next side of the stack.
//
// This is scalo's health contract expressed in Next.js, so dfe-ui probes the same way
// the Rust services do: same paths, same bodies, same semantics.
//
// | Endpoint | Semantics         | Fails when         | K8s action        |
// |----------|-------------------|--------------------|-------------------|
// | /livez   | process alive     | never              | kill + restart    |
// | /readyz  | ready for traffic | ready flag cleared | pull from Service |
//
// Those two are the whole surface. There are no aliases and no startup route: a
// second path meaning the same thing eventually stops meaning the same thing, and
// an alias that keeps answering 200 hides a probe still aimed at a retired name.
//
// A startupProbe targets /livez. Kubernetes suspends liveness until the startup probe
// passes, so one path gives both a generous boot budget and a tight liveness period
// without the two drifting apart.
//
// The one deviation from the Rust services, and it is forced: they host health on the
// METRICS port (9090) because scalo runs a second HTTP server. Next.js has exactly one
// listener, so these ride :3000. Paths and bodies are unchanged, which is what the
// probes and the operators actually read.
//
// WHY THIS EXISTS: the dfe-ui chart probed paths the app did not serve -- every probe
// 404'd, so readiness never passed and liveness restarted the pod forever (392 restarts
// on one cluster). That also jammed `dfe-ops verify`, whose gate is
// all-pods-Ready, and so blocked the default E2E acceptance for the whole deploy.
//
// Beware the near-miss that replaced it: once routes existed they sat behind the auth
// middleware and answered 307 -> /login, and k8s counts 3xx as SUCCESS, so the probe
// would have gone green on the login redirect while the app was face down. Keep these
// paths in the middleware bypass in proxy.ts.

export type HealthBody = { status: string };

const OK = 200;
const UNAVAILABLE = 503;

// Next may keep a warm module across requests, so this survives as process state.
let ready = true;

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
