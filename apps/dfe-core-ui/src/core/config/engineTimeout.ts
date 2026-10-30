/**
 * How long a server-side call waits on the engine before it counts as not
 * answering. Without it a silent engine holds every page behind the proxy.
 */
export const ENGINE_CALL_TIMEOUT_MS = 5000;

/** How long a browser read waits on the engine before it fails with the reason. */
export const ENGINE_READ_DEADLINE_MS = 30_000;

/** How long a browser write waits on the engine before it fails with the reason. */
export const ENGINE_WRITE_DEADLINE_MS = 120_000;

/** How long a read that scans a whole ClickHouse table waits (json-paths, sample-rows). */
export const ENGINE_SCAN_DEADLINE_MS = 120_000;

/** How long the ClickHouse Cloud status read waits: the engine tries the Cloud API 3 times at 30 s each. */
export const ENGINE_CLICKHOUSE_CLOUD_DEADLINE_MS = 100_000;

/** What a gateway answers for an engine that is down or restarting, which says nothing about the request. */
export const GATEWAY_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);
