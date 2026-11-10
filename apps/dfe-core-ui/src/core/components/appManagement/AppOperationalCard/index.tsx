'use client';

import { useFetchAppMetrics } from '@/core/hooks/apps/operations/useFetchAppMetrics';
import { useFetchAppResourceSeries } from '@/core/hooks/apps/operations/useFetchAppResourceSeries';
import { TAppResourceBucket } from '@/core/hooks/apps/operations/useFetchAppResourceSeries/types';
import { useFetchAppStatus } from '@/core/hooks/apps/operations/useFetchAppStatus';
import { useFetchAppTotals } from '@/core/hooks/apps/operations/useFetchAppTotals';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { useHyperdxUrl } from '@/core/contexts/HyperdxContext';
import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { formatBytes } from '@/core/helpers/format.helpers';
import { IconChevronDown } from '@repo/dfe-icons';
import { Dropdown, Spin, Tag } from 'antd';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import {
  CPU_SECONDS,
  describeMetric,
  formatCpuUsed,
  formatDuration,
  formatRange,
  formatRate,
  formatReading,
  formatResourceName,
  formatResourceValue,
  formatTotal,
  formatWindow,
  MEMORY_LIMIT,
  MEMORY_USAGE,
  START_TIME,
} from './formatMetric';

const HOUR_SECONDS = 3600;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const RANGE_PRESETS = [
  HOUR_SECONDS,
  6 * HOUR_SECONDS,
  DAY_SECONDS,
  7 * DAY_SECONDS,
  30 * DAY_SECONDS,
];
// The engine reads 0 as everything the gauge table still holds
const WHOLE_RETENTION = 0;
// The engine reads 0 as one bucket over the whole range
const ONE_BUCKET = 0;
// Fits "0.033 cores" and "805.31 MB" with room to spare
const VALUE_COLUMN_WIDTH = 160;
// Apps report about once a minute, so faster gains nothing
const LIVE_REFRESH_MS = 30_000;

// Shown in totals, the memory row or uptime rather than as current readings
const SHOWN_ELSEWHERE = new Set([CPU_SECONDS, MEMORY_LIMIT, START_TIME]);

const rangeOptions = (retentionSeconds?: number | null) => [
  ...RANGE_PRESETS.filter(
    (seconds) => retentionSeconds == null || seconds < retentionSeconds,
  ).map((seconds) => ({ label: formatRange(seconds), value: seconds })),
  {
    label: retentionSeconds ? formatRange(retentionSeconds) : 'All Time',
    value: WHOLE_RETENTION,
  },
];

/** The range option in effect, the whole retention past a short one as the engine clamps. */
const shownRange = ({
  rangeSeconds,
  retentionSeconds,
}: {
  rangeSeconds: number;
  retentionSeconds?: number | null;
}) => {
  const options = rangeOptions(retentionSeconds);
  return (
    options.find((option) => option.value === rangeSeconds) ??
    options[options.length - 1]
  );
};

const renderResource = (value: number, row: TAppResourceBucket) =>
  formatResourceValue(row.metric, value);

// Only platform users get the otel_logs source, as ClickHouse allows
// The filter ticks the component in Search's ServiceName facet
const logsHref = (telemetryName: string) =>
  `/observe/search?${new URLSearchParams({
    filters: JSON.stringify([
      { type: 'sql', condition: `ServiceName IN ('${telemetryName}')` },
    ]),
    source: 'otel_logs',
  }).toString()}`;

type TMetricTag = { description?: string; key: string; text: string };

const byText = (a: TMetricTag, b: TMetricTag) => a.text.localeCompare(b.text);

/** One section of tags, each describing its metric on hover. */
const MetricTags = ({
  items,
  title,
}: {
  items: TMetricTag[];
  title: string;
}) => (
  <div>
    <h3 className="mb-1 text-sm font-semibold">{title}</h3>
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.key}>
          <Tooltip title={item.description}>
            <Tag>{item.text}</Tag>
          </Tooltip>
        </li>
      ))}
    </ul>
  </div>
);

// Reads as header text, the range a menu in place of a form field
const rangeTitle = ({
  heading,
  onChange,
  rangeSeconds,
  retentionSeconds,
}: {
  heading: string;
  onChange: (seconds: number) => void;
  rangeSeconds: number;
  retentionSeconds?: number | null;
}) => {
  const options = rangeOptions(retentionSeconds);
  const shown = shownRange({ rangeSeconds, retentionSeconds }).value;
  return (
    <span className="inline-flex items-center gap-2">
      {heading}
      <Dropdown
        trigger={['click']}
        menu={{
          items: options.map((option) => ({
            key: String(option.value),
            label: option.label,
          })),
          selectable: true,
          selectedKeys: [String(shown)],
          onClick: ({ key }) => onChange(Number(key)),
        }}
      >
        <button
          type="button"
          aria-label={`${heading} range`}
          className="bg-foreground/10 dark:bg-dark-foreground/10 hover:bg-foreground/5 dark:hover:bg-dark-foreground/5 inline-flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-1 text-xs font-normal"
        >
          {options.find((option) => option.value === shown)?.label}
          <IconChevronDown className="h-3.5 w-3.5" />
        </button>
      </Dropdown>
    </span>
  );
};

// The memory limit and the CPU time over the range sit beside their rows
const resourceColumns = ({
  cpuTotal,
  memoryLimit,
  title,
}: {
  cpuTotal?: number;
  memoryLimit?: number;
  title: ReactNode;
}) => [
  {
    title,
    dataIndex: 'metric',
    key: 'metric',
    render: (metric: string) => {
      if (metric === MEMORY_USAGE && memoryLimit !== undefined) {
        return `${formatResourceName(metric)} (limit ${formatBytes(memoryLimit)})`;
      }
      if (metric === CPU_SECONDS && cpuTotal !== undefined) {
        return `${formatResourceName(metric)} (${formatDuration(cpuTotal)} total)`;
      }
      return formatResourceName(metric);
    },
  },
  {
    title: 'Average',
    dataIndex: 'average',
    key: 'average',
    render: renderResource,
    width: VALUE_COLUMN_WIDTH,
  },
  {
    title: 'p95',
    dataIndex: 'p95',
    key: 'p95',
    render: renderResource,
    width: VALUE_COLUMN_WIDTH,
  },
  {
    title: 'Peak',
    dataIndex: 'maximum',
    key: 'maximum',
    render: renderResource,
    width: VALUE_COLUMN_WIDTH,
  },
];

/**
 * What the instance is actually doing: reporting or not, throughput, and the
 * CPU and memory it used over a chosen range.
 *
 * The resource summary sits here rather than on its own page because it is
 * what tells you whether the vertical dials are set anywhere near reality.
 */
export const AppOperationalCard = ({
  service,
  instance,
  live = false,
  process,
  settingsHref,
}: {
  service: string;
  instance: string;
  /** Refetch every 30s, for the card on screen. */
  live?: boolean;
  /** One of the engine's own processes, read instead of the instance. */
  process?: string;
  /** Where this component's scaling and settings are edited. */
  settingsHref?: string;
}) => {
  const [rangeSeconds, setRangeSeconds] = useState(HOUR_SECONDS);
  const hyperdxUrl = useHyperdxUrl();
  const refetchInterval = live ? LIVE_REFRESH_MS : false;
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useFetchAppStatus({ service, instance, process, refetchInterval });
  const { data: metrics, error: metricsError } = useFetchAppMetrics({
    service,
    instance,
    process,
    refetchInterval,
  });
  const { data: series } = useFetchAppResourceSeries({
    service,
    instance,
    process,
    windowSeconds: rangeSeconds,
    bucketSeconds: ONE_BUCKET,
    refetchInterval,
  });
  const { data: counted } = useFetchAppTotals({
    service,
    instance,
    process,
    windowSeconds: rangeSeconds,
    refetchInterval,
  });

  // The engine answers 503 when it cannot reach the telemetry store. That is
  // "we do not know", not "the app is down", and it must not read as the
  // latter.
  if (statusError) {
    return (
      <SectionCard title="Status">
        <NotificationCard
          type="info"
          title="Telemetry is not available"
          description={statusError.message}
        />
      </SectionCard>
    );
  }

  if (isLoadingStatus) {
    return (
      <SectionCard title="Status">
        <Spin size="small" />
      </SectionCard>
    );
  }

  const gauges = metrics?.gauges ?? {};
  const resourceRows = (series?.buckets ?? [])
    .filter((row) => row.metric !== MEMORY_LIMIT)
    .sort((a, b) =>
      formatResourceName(a.metric).localeCompare(formatResourceName(b.metric)),
    );
  const cpuTotal = counted?.totals?.[CPU_SECONDS];
  // CPU time rides on its table row, as a tag only where the table has none
  const cpuInTable = resourceRows.some((row) => row.metric === CPU_SECONDS);
  const totals = Object.entries(counted?.totals ?? {})
    .filter(([name]) => !(name === CPU_SECONDS && cpuInTable))
    .map(([name, value]) => ({
      description: describeMetric(name),
      key: name,
      text:
        name === CPU_SECONDS ? formatCpuUsed(value) : formatTotal(name, value),
    }))
    .sort(byText);
  const throughput = Object.entries(metrics?.rates ?? {})
    .map(([name, value]) => ({
      description: describeMetric(name),
      key: name,
      text: formatRate(name, value),
    }))
    .sort(byText);
  const readings = Object.entries(gauges)
    .filter(([name]) => !SHOWN_ELSEWHERE.has(name))
    .map(([name, value]) => ({
      description: describeMetric(name),
      key: name,
      text: formatReading(
        name,
        value,
        name === MEMORY_USAGE ? gauges[MEMORY_LIMIT] : undefined,
      ),
    }))
    .sort(byText);
  const startTime = status?.started_epoch ?? gauges[START_TIME];
  const uptime = status?.uptime_seconds;

  return (
    <>
      <SectionCard title="Status">
        <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
          {`Telemetry name: ${status?.telemetry_name ?? '-'}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {status?.reporting ? (
            <Tag color="green">reporting</Tag>
          ) : (
            <Tag color="red">not reporting</Tag>
          )}
          <Tooltip
            title={
              startTime == null
                ? undefined
                : `Started ${formatEpochSecondsLocal(startTime)}`
            }
          >
            <Tag>
              Uptime {uptime == null ? 'unknown' : formatDuration(uptime)}
            </Tag>
          </Tooltip>
          {hyperdxUrl && status?.telemetry_name && (
            <Link href={logsHref(status.telemetry_name)}>
              <Tag className="cursor-pointer hover:underline">View Logs</Tag>
            </Link>
          )}
          {settingsHref && (
            <RbacProtected action={RbacProtected.rbacActions.helmvars_read}>
              <RbacProtected.Unrestricted>
                <Link href={settingsHref}>
                  <Tag className="cursor-pointer hover:underline">Settings</Tag>
                </Link>
              </RbacProtected.Unrestricted>
            </RbacProtected>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Metrics">
        {metricsError && (
          <NotificationCard
            type="info"
            variant="subtle"
            title="Metrics are not available"
            description={metricsError.message}
          />
        )}

        {metrics && throughput.length > 0 && (
          <MetricTags
            items={throughput}
            title={`Throughput (Last ${formatWindow(metrics.window_seconds)})`}
          />
        )}

        {readings.length > 0 && (
          <MetricTags items={readings} title="Current Readings" />
        )}
      </SectionCard>

      <SectionCard
        title={rangeTitle({
          heading: 'Usage',
          onChange: setRangeSeconds,
          rangeSeconds,
          retentionSeconds: series?.retention_seconds,
        })}
      >
        {totals.length > 0 && <MetricTags items={totals} title="Totals" />}

        {resourceRows.length > 0 && (
          <div>
            <Table
              rowKey="metric"
              columns={resourceColumns({
                cpuTotal,
                memoryLimit: gauges[MEMORY_LIMIT],
                title: 'Resources',
              })}
              dataSource={resourceRows}
              // Fixed columns hold still as values and the range change
              tableLayout="fixed"
              // A few rows never need the wrapper's scrolling body
              scroll={undefined}
            />
          </div>
        )}

        {totals.length === 0 && resourceRows.length === 0 && (
          <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
            Nothing reported in this range
          </p>
        )}
      </SectionCard>
    </>
  );
};
