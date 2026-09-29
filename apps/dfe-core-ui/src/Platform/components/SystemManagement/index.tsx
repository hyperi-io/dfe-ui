import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { ClickhouseCloudStatus } from './ClickhouseCloudStatus';
import { ClientConfig } from './ClientConfig';
import SystemSettings from './SystemSettings';
import { RetentionCard } from './SystemSettings/RetentionCard';
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
      <RetentionCard />
      <SystemVersion />
    </CustomScrollbar>
  );
};
