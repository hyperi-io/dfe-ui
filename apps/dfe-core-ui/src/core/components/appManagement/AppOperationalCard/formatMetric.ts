import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { formatBytes, formatDecimal } from '@/core/helpers/format.helpers';

const BYTES_SUFFIX = '_bytes';
const CPU_USED = 'cpu_used';
const DAY_SECONDS = 86_400;
const HOUR_SECONDS = 3600;
const START_TIME_SUFFIX = 'start_time_seconds';
const SECONDS_SUFFIX = '_seconds';

export const CPU_SECONDS = 'process_cpu_seconds_total';
export const MEMORY_LIMIT = 'container_memory_limit_bytes';
export const MEMORY_USAGE = 'container_memory_usage_bytes';
export const START_TIME = 'start_time_seconds';

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(3);

const counterName = (name: string) => name.replace(/_total$/, '');

/** A counter's rate, named without `_total` because the value is per second. */
export const formatRate = (name: string, rate: number) =>
  `${counterName(name)} ${formatNumber(rate)}/s`;

/** A counter's total since the app started. */
export const formatTotal = (name: string, total: number) =>
  `${counterName(name)} ${formatDecimal(total, 0)}`;

/** A span of time in its two largest units, such as `1d 21h`, `1h 10m` or `45s`. */
export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / HOUR_SECONDS);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours >= 1) {
    return `${hours}h ${Math.floor((seconds % HOUR_SECONDS) / 60)}m`;
  }
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
  return `${Math.round(seconds)}s`;
};

/** CPU time used, which runs slower than elapsed time unless a core stays busy. */
export const formatCpuUsed = (seconds: number) =>
  `${CPU_USED} ${formatDuration(seconds)}`;

export const formatCores = (cores: number) =>
  `${formatNumber(cores)} ${cores === 1 ? 'core' : 'cores'}`;

export const formatWindow = (seconds: number) => {
  if (seconds % 60 !== 0) return `${seconds}s`;
  const minutes = seconds / 60;
  return `${minutes} Minute${minutes === 1 ? '' : 's'}`;
};

/** A Usage range as the dropdown names it, such as `Last Hour` or `Last 90 Days`. */
export const formatRange = (seconds: number) => {
  const days = seconds / DAY_SECONDS;
  if (Number.isInteger(days) && days > 1) return `Last ${days} Days`;
  const hours = seconds / HOUR_SECONDS;
  if (hours === 1) return 'Last Hour';
  if (Number.isInteger(hours)) return `Last ${hours} Hours`;
  return `Last ${formatWindow(seconds)}`;
};

/** A reading's name without the unit its formatted value already shows. */
export const formatReadingName = (name: string) => {
  if (name.endsWith(BYTES_SUFFIX)) return name.slice(0, -BYTES_SUFFIX.length);
  if (name.endsWith(START_TIME_SUFFIX)) {
    return name.slice(0, -SECONDS_SUFFIX.length);
  }
  return name;
};

export const formatReadingValue = (name: string, value: number) => {
  if (name.endsWith(BYTES_SUFFIX)) return formatBytes(value);
  if (name.endsWith(START_TIME_SUFFIX)) return formatEpochSecondsLocal(value);
  return formatNumber(value);
};

/** A reading, shown against its limit and as a share of it when there is one. */
export const formatReading = (name: string, value: number, limit?: number) => {
  const reading = `${formatReadingName(name)} ${formatReadingValue(name, value)}`;
  if (limit === undefined) return reading;
  const share =
    limit > 0 ? ` (${formatDecimal((value / limit) * 100, 1)}%)` : '';
  return `${reading} / ${formatBytes(limit)}${share}`;
};

/** A Resources row's name: the engine reports CPU there as cores used, not seconds. */
export const formatResourceName = (name: string) =>
  name === CPU_SECONDS ? CPU_USED : formatReadingName(name);

export const formatResourceValue = (name: string, value: number) =>
  name === CPU_SECONDS ? formatCores(value) : formatReadingValue(name, value);

// Meanings from scalo-rs, each short enough for one tooltip line
export const METRIC_DESCRIPTIONS: Record<string, string> = {
  clickhouse_connected: '1 when ClickHouse answers',
  clickhouse_insert_errors_total: 'Inserts that failed for good',
  consumer_lag: 'Worst partition lag (messages)',
  container_memory_usage_bytes: 'Container memory in use',
  dfe_hunt_backlog: 'Hunts due and unclaimed',
  dfe_hunt_claims_total: 'Attempts to claim a due hunt',
  dfe_hunt_clickhouse_unavailable_total: 'Retries with ClickHouse down',
  dfe_hunt_detections_dropped_total: "Matches past the rule's cap",
  dfe_hunt_fire_failures_total: 'Hunt fires that failed',
  dfe_hunt_overruns_total: 'Fires deferred by a prior run',
  dfe_hunt_rows_written_total: 'Rows hunt statements inserted',
  dfe_hunt_runs_total: 'Hunt fires executed',
  http_request_duration_p95_seconds: '95th percentile request time',
  http_requests_total: 'HTTP requests served',
  http_server_errors_total: 'Requests that got a 5xx',
  pipeline_ready: '1 when the pipeline is ready',
  process_cpu_seconds_total: 'CPU time used since start',
  process_open_fds: 'Open files and sockets',
  receiver_active_connections: 'Open client connections',
  records_delivered_total: 'Records delivered to the sink',
  records_dlq_total: 'Records sent to the DLQ',
  records_error_total: 'Records that failed',
  records_processed_total: 'Records processed successfully',
  records_received_total: 'Records read from all sources',
  scaling_pressure: 'KEDA scaling signal, 0 to 100',
  sink_errors_total: 'Sink writes that failed',
  worker_pool_active_threads: 'Workers running a task now',
  worker_pool_cpu_utilisation: 'Host CPU in use, 0 to 1',
  worker_pool_saturation: 'Share of pool workers busy',
};

/** What a metric means, shown on hover, or undefined for one with no description. */
export const describeMetric = (name: string): string | undefined =>
  METRIC_DESCRIPTIONS[name];
