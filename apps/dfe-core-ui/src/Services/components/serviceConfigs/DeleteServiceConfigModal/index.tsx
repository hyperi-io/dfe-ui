import { useDeleteServiceConfig } from '@/Services/hooks/serviceConfigs/useDeleteServiceConfig';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, ButtonProps, Modal, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';

interface DeleteServiceConfigModalProps {
  serviceConfigName: string;
  serviceConfigInstanceName: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const DeleteServiceConfigModal = ({
  serviceConfigName,
  serviceConfigInstanceName,
  onSuccess,
  trigger,
}: DeleteServiceConfigModalProps) => {
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useDeleteServiceConfig({
    onSuccess: () => {
      setOpen(false);
      notification.success({
        title: 'Service config deleted successfully',
        description: `Service config ${serviceConfigName}/${serviceConfigInstanceName} deleted successfully`,
        placement: 'bottomLeft',
      });
      onSuccess?.();
    },
  });
  const handleDeleteServiceConfig = () => {
    mutate({
      service_name: serviceConfigName,
      service_instance: serviceConfigInstanceName,
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.service_delete}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setOpen(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Tooltip
              destroyOnHidden
              title={`Delete ${serviceConfigName}/${serviceConfigInstanceName}`}
            >
              <Button
                type="default"
                shape="circle"
                size="small"
                className="hover:border-error hover:text-error"
                aria-label={`Delete ${serviceConfigName}/${serviceConfigInstanceName}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </Tooltip>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setOpen(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                size="small"
                disabled
                className="hover:border-error hover:text-error"
                aria-label={`Delete ${serviceConfigName}/${serviceConfigInstanceName}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${serviceConfigName}/${serviceConfigInstanceName}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button
              loading={isPending}
              disabled={isPending}
              type="primary"
              danger
              onClick={handleDeleteServiceConfig}
            >
              Delete
            </Button>
            <Button
              loading={isPending}
              disabled={isPending}
              type="default"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this service config?</p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
