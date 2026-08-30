'use client';

import { useFetchAppMetrics } from '@/core/hooks/apps/operations/useFetchAppMetrics';
import { useFetchAppResourceSeries } from '@/core/hooks/apps/operations/useFetchAppResourceSeries';
import { useFetchAppStatus } from '@/core/hooks/apps/operations/useFetchAppStatus';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { Spin, Tag } from 'antd';
import { summariseBuckets, TResourceSummary } from './summariseBuckets';

const RESOURCE_WINDOW_SECONDS = 3600;

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(3);

const formatUptime = (seconds?: number | null) => {
  if (seconds == null) return 'unknown';
  const hours = Math.floor(seconds / 3600);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 60)}m`;
};

const RESOURCE_COLUMNS = [
  { title: 'Metric', dataIndex: 'metric', key: 'metric' },
  {
    title: 'Latest',
    dataIndex: 'latest',
    key: 'latest',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Average',
    dataIndex: 'average',
    key: 'average',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'p95',
    dataIndex: 'p95',
    key: 'p95',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Peak',
    dataIndex: 'peak',
    key: 'peak',
    render: (value: number) => formatNumber(value),
  },
];

/**
 * What the instance is actually doing: reporting or not, throughput, and the
 * CPU and memory it used over the last hour.
 *
 * The resource summary sits here rather than on its own page because it is
 * what tells you whether the vertical dials are set anywhere near reality.
 */
export const AppOperationalCard = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useFetchAppStatus({ service, instance });
  const { data: metrics, error: metricsError } = useFetchAppMetrics({
    service,
    instance,
  });
  const { data: series } = useFetchAppResourceSeries({
    service,
    instance,
    windowSeconds: RESOURCE_WINDOW_SECONDS,
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

  const resourceRows: TResourceSummary[] = summariseBuckets(
    series?.buckets ?? [],
  );
  const gauges = Object.entries(metrics?.gauges ?? {});
  const rates = Object.entries(metrics?.rates ?? {});

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
          <span className="text-sm">
            Uptime {formatUptime(status?.uptime_seconds)}
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Metrics">
        {metrics && (
          <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
            {`Over the last ${metrics.window_seconds}s`}
          </p>
        )}
        {metricsError && (
          <NotificationCard
            type="info"
            variant="subtle"
            title="Metrics are not available"
            description={metricsError.message}
          />
        )}

        {rates.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold">
              Throughput (per second)
            </h3>
            <ul className="flex flex-wrap gap-2">
              {rates.map(([name, value]) => (
                <li key={name}>
                  <Tag>{`${name} ${formatNumber(value)}`}</Tag>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gauges.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold">Current readings</h3>
            <ul className="flex flex-wrap gap-2">
              {gauges.map(([name, value]) => (
                <li key={name}>
                  <Tag>{`${name} ${formatNumber(value)}`}</Tag>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resourceRows.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold">
              CPU and memory over the last hour
            </h3>
            <Table
              rowKey="metric"
              columns={RESOURCE_COLUMNS}
              dataSource={resourceRows}
            />
          </div>
        )}
      </SectionCard>
    </>
  );
};
