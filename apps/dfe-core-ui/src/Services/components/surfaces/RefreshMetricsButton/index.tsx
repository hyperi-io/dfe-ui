import { RbacProtected } from '@/core/components/RbacProtected';
import { useRefreshServiceSurfaceMetrics } from '@/Services/hooks/serviceSurfaces/useRefreshServiceSurfaceMetrics';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';

export const RefreshMetricsButton = ({
  serviceName,
}: {
  serviceName: string;
}) => {
  const { notification } = App.useApp();
  const { mutate: refreshMetrics, isPending } = useRefreshServiceSurfaceMetrics(
    {
      onSuccess: () => {
        notification.success({
          title: 'Metrics refreshed successfully',
          placement: 'bottomLeft',
        });
      },
      onError: (error) => {
        notification.error({
          title: 'Unexpected error refreshing metrics',
          description: error.message,
          placement: 'bottomLeft',
        });
      },
    },
  );
  return (
    <RbacProtected action={RbacProtected.rbacActions.service_surface_write}>
      <RbacProtected.Unrestricted>
        <Button
          type="default"
          onClick={() => refreshMetrics({ name: serviceName })}
          icon={<IconRefresh />}
          loading={isPending}
        >
          Refresh Metrics
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button
          type="default"
          disabled
          icon={<IconRefresh />}
          loading={isPending}
        >
          Refresh Metrics {serviceName}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
