/**
 * How long a server-side call waits on the engine before it counts as not
 * answering. Without it a silent engine holds every page behind the proxy.
 */
export const ENGINE_CALL_TIMEOUT_MS = 5000;

/** What a gateway answers for an engine that is down or restarting, which says nothing about the request. */
export const GATEWAY_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);
