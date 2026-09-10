import { uiBuildVersion } from '@/core/appVersion/buildVersion';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchSystemVersion } from '@/Platform/hooks/system/useFetchSystemVersion';
import { Spin } from 'antd';

export const SystemVersion = () => {
  const {
    data: systemVersion,
    isLoading: isSystemVersionLoading,
    error: systemVersionError,
  } = useFetchSystemVersion();
  return (
    <SectionCard title="System Version">
      {isSystemVersionLoading && (
        <>
          <Spin /> <span className="sr-only">Loading system version...</span>
        </>
      )}
      {systemVersionError && (
        <div className="flex items-center gap-2">
          <NotificationCard
            title="Error"
            description={systemVersionError.message}
            type="error"
          />
        </div>
      )}
      {systemVersion && (
        <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 text-xs">
          {/* The certified stack is what an operator upgrades; the engine's own
              version only answers when nothing states one. */}
          <dt>Stack</dt>
          <dd>{systemVersion.stack ?? 'not stated'}</dd>
          <dt>Engine</dt>
          <dd>{systemVersion.engine}</dd>
          <dt>UI</dt>
          <dd>{systemVersion.ui ?? uiBuildVersion() ?? 'not stated'}</dd>
          <dt>Python Version</dt>
          <dd>{systemVersion.python_version}</dd>
        </dl>
      )}
    </SectionCard>
  );
};
