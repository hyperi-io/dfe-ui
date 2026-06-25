import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useFetchInfiniteFilteredAlerts } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts';
import { Spin } from 'antd';
import { AlertCard } from './AlertCard';
import { CreateAlertModal } from './CreateAlertModal';

export const AlertsConfigTab = ({ hunt }: { hunt: HuntDetailResponse }) => {
  const {
    data: { items: alerts },
    isLoading,
    refetch,
    error,
  } = useFetchInfiniteFilteredAlerts({
    hunt: hunt.name,
  });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading alerts</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching alerts"
        description={error.message}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotificationCard
        title="Create Alert"
        description="Create a new alert for this hunt"
        action={
          <CreateAlertModal
            onSuccess={() => {
              refetch();
            }}
            hunt_name={hunt.name}
          />
        }
      />
      {alerts.length === 0 && (
        <EmptyDetail
          title="No alerts found"
          description="No alerts found for this hunt"
        />
      )}
      {alerts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li key={alert.name}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
