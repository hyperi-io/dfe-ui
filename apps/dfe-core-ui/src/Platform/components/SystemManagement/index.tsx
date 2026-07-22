import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import { ClientConfig } from './ClientConfig';
import SystemSettings from './SystemSettings';
import { SystemVersion } from './SystemVersion';

export const SystemManagement = () => {
  return (
    <>
      <ClickhouseCloudStatus />
      <ClientConfig />
      <SystemSettings />
      <SystemVersion />
    </>
  );
};
