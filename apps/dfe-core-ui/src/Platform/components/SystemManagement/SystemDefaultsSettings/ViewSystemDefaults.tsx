import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TSystemDefaultsResponse } from '@/core/hooks/useFetchDefaults/types';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';
const formatDays = (days: number) =>
  days === 0 ? 'none (kept forever)' : `${days} days`;

export const ViewSystemDefaults = ({
  defaults,
  error,
  isLoading = false,
}: {
  defaults?: TSystemDefaultsResponse;
  error: Error | null;
  isLoading?: boolean;
}) => {
  return (
    <RbacProtected action={RbacProtected.rbacActions.system_read}>
      <RbacProtected.Unrestricted>
        <>
          {error ? (
            <FormNotification
              type="error"
              text={`The defaults could not be loaded: ${error.message}`}
            />
          ) : isLoading || !defaults ? (
            <p className={dataListTermStyle}>Loading defaults...</p>
          ) : (
            <dl className="grid grid-rows-[34px] max-[1452px]:grid-cols-[150px_1fr] grid-cols-[150px_1fr_100px_1fr] gap-x-4 gap-y-1 text-xs items-center">
              <dt className={dataListTermStyle}>Default Retention</dt>
              <dd>{formatDays(defaults.ttl_days.effective)}</dd>

              <dt className={dataListTermStyle}>Default Engine</dt>
              <dd>{defaults.engine.effective}</dd>
              <dt className={dataListTermStyle}>Default Header & Version</dt>
              <dd className="max-[1452px]:col-span-1 col-span-3">
                {defaults.common_header_type.effective}@v
                {defaults.common_header_version.effective}
              </dd>
            </dl>
          )}
          <p className="mt-2 break-words text-xs text-foreground/50 dark:text-foreground/50">
            Set by DFE_ENGINE_CLICKHOUSE_DEFAULT_TTL_DAYS. A change applies to
            every table that follows the default when the engine restarts.
          </p>
        </>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <RbacProtected.RestrictedRoute />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
