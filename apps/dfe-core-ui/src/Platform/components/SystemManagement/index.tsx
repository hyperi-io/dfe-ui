import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import { ClientConfig } from './ClientConfig';
import SystemSettings from './SystemSettings';
import { RetentionCard } from './SystemSettings/RetentionCard';
import { SystemVersion } from './SystemVersion';

export const SystemManagement = () => {
  return (
    <>
      <ClickhouseCloudStatus />
      <ClientConfig />
      <SystemSettings />
      <RetentionCard />
      <SystemVersion />
    </>
  );
};
