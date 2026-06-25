import { AlertListResponseItem } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts/types';
import { useUpdateAlert } from '@/Hunts/hooks/useUpdateAlert';
import {
  CreateUpdateAlertForm,
  EditAlertCardFormData,
} from './CreateUpdateAlertForm';

export const UpdateAlertForm = ({
  onFinish,
  alert,
}: {
  onFinish?: (values: EditAlertCardFormData) => void;
  alert: AlertListResponseItem;
}) => {
  const {
    mutate: updateAlert,
    isPending: isUpdatingAlert,
    error: updateAlertError,
  } = useUpdateAlert({
    name: alert.name,
  });

  const handleFinish = (values: EditAlertCardFormData) => {
    updateAlert(values);
    onFinish?.(values);
  };
  return (
    <CreateUpdateAlertForm
      onFinish={handleFinish}
      initialValues={{
        name: alert.name,
        url: alert.url_scheme,
        description: alert.description,
        enabled: alert.enabled,
      }}
      isPending={isUpdatingAlert}
      error={updateAlertError}
    />
  );
};
