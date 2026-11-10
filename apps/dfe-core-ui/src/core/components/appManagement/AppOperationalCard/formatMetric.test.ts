import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { describe, expect, it } from 'vitest';
import {
  CPU_SECONDS,
  describeMetric,
  formatCores,
  formatCpuUsed,
  formatDuration,
  formatRange,
  formatRate,
  formatReading,
  formatReadingValue,
  formatResourceName,
  formatResourceValue,
  formatTotal,
  formatWindow,
  MEMORY_USAGE,
  METRIC_DESCRIPTIONS,
} from './formatMetric';

describe('formatRate', () => {
  it.each([
    ['http_requests_total', 0.1956, 'http_requests 0.196/s'],
    ['records_processed_total', 12, 'records_processed 12/s'],
    ['a_rate_without_the_suffix', 1.5, 'a_rate_without_the_suffix 1.500/s'],
  ])('%s', (name, rate, expected) => {
    expect(formatRate(name, rate)).toBe(expected);
  });
});

describe('formatTotal', () => {
  it.each([
    ['records_processed_total', 12345, 'records_processed 12,345'],
    ['records_dlq_total', 0, 'records_dlq 0'],
  ])('%s', (name, total, expected) => {
    expect(formatTotal(name, total)).toBe(expected);
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [45.4, '45s'],
    [60, '1m'],
    [4204, '1h 10m'],
    [86_400, '1d 0h'],
    [162_000, '1d 21h'],
  ])('%s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('formatCpuUsed', () => {
  it('shows CPU time as a duration', () => {
    expect(formatCpuUsed(4204.3)).toBe('cpu_used 1h 10m');
  });
});

describe('formatCores', () => {
  it.each([
    [0.0259, '0.026 cores'],
    [1, '1 core'],
    [2, '2 cores'],
    [0, '0 cores'],
  ])('%s', (cores, expected) => {
    expect(formatCores(cores)).toBe(expected);
  });
});

describe('formatWindow', () => {
  it.each([
    [300, '5 Minutes'],
    [60, '1 Minute'],
    [90, '90s'],
  ])('%s', (seconds, expected) => {
    expect(formatWindow(seconds)).toBe(expected);
  });
});

describe('formatRange', () => {
  it.each([
    [3600, 'Last Hour'],
    [21_600, 'Last 6 Hours'],
    [86_400, 'Last 24 Hours'],
    [604_800, 'Last 7 Days'],
    [7_776_000, 'Last 90 Days'],
    [1800, 'Last 30 Minutes'],
  ])('%s', (seconds, expected) => {
    expect(formatRange(seconds)).toBe(expected);
  });
});

describe('describeMetric', () => {
  it.each([
    [CPU_SECONDS, 'CPU time used'],
    [MEMORY_USAGE, 'memory in use'],
    ['records_received_total', 'all sources'],
  ])('%s', (name, text) => {
    expect(describeMetric(name)).toContain(text);
  });

  // antd's tooltip is 250px wide, about 30 characters a line
  it.each(Object.entries(METRIC_DESCRIPTIONS))(
    'keeps %s to one tooltip line',
    (_name, description) => {
      expect(description.length).toBeLessThanOrEqual(30);
    },
  );

  it('gives a metric it does not know no description', () => {
    expect(describeMetric('an_unlisted_metric')).toBeUndefined();
  });
});

describe('formatResourceName and formatResourceValue', () => {
  it.each([
    [CPU_SECONDS, 0.0259, 'cpu_used', '0.026 cores'],
    [MEMORY_USAGE, 25_550_000, 'container_memory_usage', '25.55 MB'],
    ['scaling_pressure', 0.621, 'scaling_pressure', '0.621'],
  ])('%s', (name, value, expectedName, expectedValue) => {
    expect(formatResourceName(name)).toBe(expectedName);
    expect(formatResourceValue(name, value)).toBe(expectedValue);
  });
});

describe('formatReading', () => {
  it.each([
    [
      'container_memory_usage_bytes',
      378683392,
      undefined,
      'container_memory_usage 379 MB',
    ],
    [
      'container_memory_usage_bytes',
      25100000,
      805306368,
      'container_memory_usage 25.1 MB / 805 MB (3.1%)',
    ],
    [
      'container_memory_usage_bytes',
      25100000,
      0,
      'container_memory_usage 25.1 MB / 0 B',
    ],
    ['process_open_fds', 20, undefined, 'process_open_fds 20'],
    [
      'http_request_duration_p95_seconds',
      0.515625,
      undefined,
      'http_request_duration_p95_seconds 0.516',
    ],
  ])('%s', (name, value, limit, expected) => {
    expect(formatReading(name, value, limit)).toBe(expected);
  });

  it('shows the start time as a local date under a name without its unit', () => {
    const epoch = 1793882988.59;

    expect(formatReading('start_time_seconds', epoch)).toBe(
      `start_time ${formatEpochSecondsLocal(epoch)}`,
    );
  });

  it('keeps a bad start time from reading as a date', () => {
    expect(formatReadingValue('start_time_seconds', Number.NaN)).toBe(
      'Invalid date',
    );
  });
});
