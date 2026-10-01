import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { ApplyDefaultsDrawer } from '@/Platform/components/SystemManagement/ApplyDefaultsDrawer';
import { useFetchDefaults } from '@/Platform/hooks/system/useFetchDefaults';
import { ViewEditDefaultEngine } from './ViewEditDefaultEngine';
import { ViewEditDefaultHeaderVersion } from './ViewEditDefaultHeaderVersion';
import { ViewEditDefaultRetention } from './ViewEditDefaultRetention';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

export const SystemDefaultsSettings = () => {
  const { data: defaults, error } = useFetchDefaults();

  return (
    <SectionCard
      title="System Defaults"
      rightTitleSlot={<ApplyDefaultsDrawer />}
    >
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          <>
            {error && <NotificationCard type="error" title={error.message} />}
            <dl className="grid grid-rows-[34px] max-[1452px]:grid-cols-[150px_1fr] grid-cols-[150px_1fr_100px_1fr] gap-x-4 gap-y-1 text-xs items-center">
              <dt className={dataListTermStyle}>Default Retention</dt>
              <dd>
                <ViewEditDefaultRetention />
              </dd>

              <dt className={dataListTermStyle}>Default Engine</dt>
              <dd>
                <ViewEditDefaultEngine
                  defaultEngine={defaults?.engine?.effective ?? ''}
                />
              </dd>
              <dt className={dataListTermStyle}>Default Header & Version</dt>
              <dd className="max-[1452px]:col-span-1 col-span-3">
                <ViewEditDefaultHeaderVersion
                  defaultHeaderVersion={
                    defaults?.common_header_version?.effective ?? ''
                  }
                  defaultHeader={defaults?.common_header_type?.effective ?? ''}
                />
              </dd>
            </dl>
            <p className="mt-2 text-xs text-foreground/50 dark:text-foreground/50">
              Set by DFE_CLICKHOUSE_DEFAULT_TTL_DAYS. A change applies to every
              table that follows the default when the engine restarts.
            </p>
          </>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
