/**
 * How long a server-side call waits on the engine before it counts as not
 * answering. Without it a silent engine holds every page behind the proxy.
 */
export const ENGINE_CALL_TIMEOUT_MS = 5000;
