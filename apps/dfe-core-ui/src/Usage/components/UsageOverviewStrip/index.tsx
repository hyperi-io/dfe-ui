'use client';

import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { useFetchUsageOverview } from '@/Usage/hooks/useFetchUsageOverview';
import {
  TUsageMetric,
  TUsageOverview,
} from '@/Usage/hooks/useFetchUsageOverview/types';
import { IconChevronRight } from '@repo/dfe-icons';
import { Skeleton } from 'antd';
import Link from 'next/link';
import { formatUsageDay, formatUsageValue } from './format';

/** The dashboard route the fork resolves to the caller's own team's Overview. */
const OVERVIEW_DASHBOARD_PATH = '/observe/dashboards/default';

const mutedText = 'text-foreground/60 dark:text-dark-foreground/60';

const UsageTile = ({
  metric,
  highestLabel,
}: {
  metric: TUsageMetric;
  highestLabel: string;
}) => {
  const highest = metric.highest_7d;
  const measured = metric.status === 'measured' && highest;
  return (
    <li
      aria-label={metric.label}
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border px-4 py-3',
        'border-foreground/15 bg-background dark:border-dark-foreground/15 dark:bg-dark-background',
      )}
    >
      <span
        className={cn('text-xs font-medium uppercase tracking-wide', mutedText)}
      >
        {metric.label}
      </span>
      {measured ? (
        <>
          <span className="text-2xl font-semibold tabular-nums">
            {formatUsageValue(metric, highest.value)}
          </span>
          <span className={cn('text-xs', mutedText)}>
            {`${highestLabel}, ${formatUsageDay(highest.day)}`}
          </span>
        </>
      ) : metric.status === 'not_permitted' ? (
        <>
          <span className={cn('text-2xl font-semibold', mutedText)}>
            Not available
          </span>
          <span className={cn('text-xs', mutedText)}>
            Counted for the whole deployment, which your access does not cover.
          </span>
        </>
      ) : (
        <>
          <span className={cn('text-2xl font-semibold', mutedText)}>
            Not measured
          </span>
          <span className={cn('text-xs', mutedText)}>
            No reading in the last 30 days.
          </span>
        </>
      )}
    </li>
  );
};

/** The four headline numbers, as the engine reports them. */
export const UsageOverviewTiles = ({
  overview,
}: {
  overview: TUsageOverview;
}) => (
  <ul
    aria-label="Usage"
    className="m-0 grid list-none grid-cols-2 gap-3 p-0 xl:grid-cols-4"
  >
    {overview.metrics.map((metric) => (
      <UsageTile
        key={metric.metric}
        metric={metric}
        highestLabel={overview.highest_7d_label}
      />
    ))}
  </ul>
);

const UsageOverviewBody = () => {
  const { data, isLoading, error } = useFetchUsageOverview();

  return (
    <section
      aria-labelledby="usage-overview-heading"
      className="flex flex-col gap-3 px-4 pt-4 pb-3"
    >
      <div className="flex items-baseline gap-3">
        <h2 id="usage-overview-heading" className="m-0 text-base font-semibold">
          Overview
        </h2>
        {data && data.orgs.length > 0 && (
          <span className={cn('text-sm', mutedText)}>
            {`Your orgs: ${data.orgs.join(', ')}`}
          </span>
        )}
        <Link
          href={OVERVIEW_DASHBOARD_PATH}
          className="ml-auto flex items-center gap-1 text-sm text-tertiary! hover:underline"
        >
          Open Overview
          <IconChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      {isLoading && <Skeleton active paragraph={{ rows: 2 }} title={false} />}
      {error && (
        <p className={cn('m-0 text-sm', mutedText)}>
          {`Usage could not be read: ${error.message}`}
        </p>
      )}
      {data && <UsageOverviewTiles overview={data} />}
    </section>
  );
};

/**
 * The usage headline above the dashboards: what is deployed and how much flows,
 * each at its highest in the last 7 days, with the Overview dashboard a click
 * away. Shown to callers who may read usage.
 */
export const UsageOverviewStrip = () => (
  <RbacProtected action={RbacProtected.rbacActions.usage_read}>
    <RbacProtected.Unrestricted>
      <UsageOverviewBody />
    </RbacProtected.Unrestricted>
  </RbacProtected>
);
