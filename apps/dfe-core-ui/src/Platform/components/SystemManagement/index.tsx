import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import { ClientConfig } from './ClientConfig';
import SystemSettings from './SystemSettings';
import { RetentionCard } from './SystemSettings/RetentionCard';
import { SystemVersion } from './SystemVersion';

export const SystemManagement = () => {
  return (
    <div className="h-full max-h-[calc(100vh-100px)] css-custom-scrollbar">
      <ClickhouseCloudStatus />
      <ClientConfig />
      <SystemSettings />
      <RetentionCard />
      <SystemVersion />
    </div>
  );
};
