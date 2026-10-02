import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import { ClientConfig } from './ClientConfig';
import { SystemDefaultsSettings } from './SystemDefaultsSettings';
import SystemSettings from './SystemSettings';
import { SystemVersion } from './SystemVersion';

export const SystemManagement = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  return (
    <CustomScrollbar height={componentHeight}>
      <ClickhouseCloudStatus />
      <ClientConfig />
      <SystemSettings />
      <SystemDefaultsSettings />
      <SystemVersion />
    </CustomScrollbar>
  );
};
