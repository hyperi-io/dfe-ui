/**
 * The page the proxy rewrites to, with a 503, when the engine cannot be
 * reached. The proxy serves it with no auth check and no engine call.
 */
export const ENGINE_UNAVAILABLE_PATH = '/engine-unavailable';
