import { useDeleteDeployment } from '@/Services/hooks/deployments/useDeleteDeployment';

import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, ButtonProps } from 'antd';
import { cloneElement, useState } from 'react';

interface DeleteDeploymentModalProps {
  service: string;
  instance: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const DeleteDeploymentModal = ({
  service,
  instance,
  onSuccess,
  trigger,
}: DeleteDeploymentModalProps) => {
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const {
    mutate: deleteDeployment,
    isPending,
    error,
  } = useDeleteDeployment({
    onSuccess: () => {
      setOpen(false);
      notification.success({
        title: 'Deployment deleted successfully',
        description: `Deployment ${service}/${instance} deleted successfully`,
        placement: 'bottomLeft',
      });
      onSuccess?.();
    },
  });
  const handleDeleteDeployment = () => {
    deleteDeployment({
      service,
      instance,
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.deployment_delete}>
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
              title={`Delete ${service}/${instance} deployment`}
            >
              <Button
                type="default"
                shape="circle"
                size="small"
                className="hover:border-error hover:text-error"
                aria-label={`Delete ${service}/${instance} deployment`}
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
                aria-label={`Delete ${service}/${instance} deployment`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${service}/${instance} deployment`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button
              loading={isPending}
              disabled={isPending}
              type="default"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              loading={isPending}
              disabled={isPending}
              type="primary"
              danger
              onClick={handleDeleteDeployment}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this deployment?</p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
