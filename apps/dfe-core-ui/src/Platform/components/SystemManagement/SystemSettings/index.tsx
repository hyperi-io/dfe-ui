import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchSystemSettings } from '@/core/hooks/useFetchSystemSettings';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

// React renders a boolean child as nothing, so the flags need a word.
const yesNo = (value: boolean | undefined) =>
  value === undefined ? '' : value ? 'Yes' : 'No';

export default function SystemSettings() {
  const { data: systemSettings, isLoading, error } = useFetchSystemSettings();
  return (
    <SectionCard title="System Settings">
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {systemSettings && (
            <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2 text-xs">
              <dt className={dataListTermStyle}>Clickhouse Host</dt>
              <dd>{systemSettings.clickhouse_host}</dd>
              <dt className={dataListTermStyle}>Clickhouse Database</dt>
              <dd>{systemSettings.clickhouse_database}</dd>
              <dt className={dataListTermStyle}>Clickhouse Data Database</dt>
              <dd>{systemSettings.clickhouse_data_database}</dd>
              <dt className={dataListTermStyle}>Sources Directory</dt>
              <dd>{systemSettings.sources_dir}</dd>
              <dt className={dataListTermStyle}>Services Config Directory</dt>
              <dd>{systemSettings.services_config_dir}</dd>
              <dt className={dataListTermStyle}>Hunts Directory</dt>
              <dd>{systemSettings.hunt_dir}</dd>
              <dt className={dataListTermStyle}>Auth Enabled</dt>
              <dd>{yesNo(systemSettings.auth_enabled)}</dd>
              <dt className={dataListTermStyle}>Auth Local Enabled</dt>
              <dd>{yesNo(systemSettings.auth_local_enabled)}</dd>
              <dt className={dataListTermStyle}>API Host</dt>
              <dd>{systemSettings.api_host}</dd>
              <dt className={dataListTermStyle}>API Port</dt>
              <dd>{systemSettings.api_port}</dd>
              <dt className={dataListTermStyle}>API CORS Origins</dt>
              <dd>{systemSettings.api_cors_origins.join(', ')}</dd>
            </dl>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
}
