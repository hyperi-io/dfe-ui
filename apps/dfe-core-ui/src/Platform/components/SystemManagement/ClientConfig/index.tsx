import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchClientConfig } from '@/Platform/hooks/clientConfig/useFetchClientConfig';
import { Spin } from 'antd';
import { Fragment } from 'react/jsx-runtime';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';
export const ClientConfig = () => {
  const { data: clientConfig, isLoading, error } = useFetchClientConfig();
  return (
    <SectionCard title="Client Configuration">
      {isLoading && (
        <>
          <Spin /> <span className="sr-only">Loading Client Config...</span>
        </>
      )}
      {error && (
        <NotificationCard
          title="Error"
          description={error.message}
          type="error"
        />
      )}
      {!isLoading && clientConfig && (
        <div className="flex flex-col gap-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {clientConfig.api_base && (
              <>
                <dt className={dataListTermStyle}>API Base</dt>
                <dd>{clientConfig.api_base}</dd>
              </>
            )}
            {clientConfig.hyperdx.enabled && (
              <>
                <dt className={dataListTermStyle}>HyperDX</dt>
                <dd>{clientConfig.hyperdx.enabled ? 'Enabled' : 'Disabled'}</dd>
              </>
            )}
            {clientConfig.hyperdx.url && (
              <>
                <dt className={dataListTermStyle}>HyperDX URL</dt>
                <dd>{clientConfig.hyperdx.url}</dd>
              </>
            )}
            {clientConfig.auth_mode && (
              <>
                <dt className={dataListTermStyle}>Auth Mode</dt>
                <dd>{clientConfig.auth_mode}</dd>
              </>
            )}
          </dl>

          <p className="text-xs">Features</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {Object.entries(clientConfig.features).map(([key, value]) => (
              <Fragment key={key}>
                <dt className={dataListTermStyle}>{key}</dt>
                <dd>{value ? 'Enabled' : 'Disabled'}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      )}
    </SectionCard>
  );
};
