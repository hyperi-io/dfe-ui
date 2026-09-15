import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchRetention } from '@/Platform/hooks/system/useFetchRetention';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

const formatDays = (days: number) =>
  days === 0 ? 'none (kept forever)' : `${days} days`;

/** The deployment default TTL, which the environment sets and the console only reports. */
export const RetentionCard = () => {
  const { data: retention, isLoading, error } = useFetchRetention();

  return (
    <SectionCard title="Retention">
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {retention && (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                <dt className={dataListTermStyle}>Default Retention</dt>
                <dd>{formatDays(retention.default_ttl_days)}</dd>
              </dl>
              <p className="mt-2 text-xs text-foreground/50 dark:text-foreground/50">
                Set by DFE_CLICKHOUSE_DEFAULT_TTL_DAYS. A change applies to
                every table that follows the default when the engine restarts.
              </p>
            </>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
