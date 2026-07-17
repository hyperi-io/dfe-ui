import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import SystemSettings from './SystemSettings';
import { SystemVersion } from './SystemVersion';

export const SystemManagement = () => {
  return (
    <>
      <ClickhouseCloudStatus />
      <SystemSettings />
      <SystemVersion />
    </>
  );
};
