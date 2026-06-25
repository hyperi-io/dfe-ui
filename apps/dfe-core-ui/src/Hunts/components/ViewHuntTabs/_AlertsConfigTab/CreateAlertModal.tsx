import { useCreateAlert } from '@/Hunts/hooks/useCreateAlert';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import {
  CreateUpdateAlertForm,
  EditAlertCardFormData,
} from './CreateUpdateAlertForm';

export const CreateAlertModal = ({
  hunt_name,
  onSuccess,
}: {
  hunt_name: string;
  onSuccess?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const { notification } = App.useApp();

  const {
    mutate: createAlert,
    isPending,
    error,
  } = useCreateAlert({
    onSuccess: (data) => {
      notification.success({
        title: `Alert ${data.name} created successfully`,
        placement: 'bottomLeft',
      });
      setOpen(false);
      onSuccess?.();
    },
  });

  const onFinish = (values: EditAlertCardFormData) => {
    createAlert({
      ...values,
      hunt_name,
    });
  };
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create Alert
      </Button>
      <Modal
        destroyOnHidden
        title="Create Alert"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <CreateUpdateAlertForm
          onFinish={onFinish}
          isPending={isPending}
          error={error}
        />
      </Modal>
    </>
  );
};
