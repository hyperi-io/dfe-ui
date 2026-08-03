import { useValidateDeployment } from '@/Services/hooks/deployments/useValidateDeployment';
import { NotificationCard } from '@/core/components/NotificationCard';

import { RbacProtected } from '@/core/components/RbacProtected';
import { IconBadge, IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { App, Button, ButtonProps, Modal, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';

interface ValidateDeploymentDrawerProps {
  serviceName: string;
  serviceInstanceName: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

const formatModalTitle = ({
  serviceName,
  serviceInstanceName,
}: {
  serviceName: string;
  serviceInstanceName: string;
}) => {
  return `Validate ${serviceName}/${serviceInstanceName}`;
};

export const ValidateDeploymentModal = ({
  serviceName,
  serviceInstanceName,
  onSuccess,
  trigger,
}: ValidateDeploymentDrawerProps) => {
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const {
    data,
    mutate: validateDeployment,
    isPending,
    error,
  } = useValidateDeployment({
    onSuccess: () => {
      setOpen(true);

      onSuccess?.();
    },
    onError: (error) => {
      notification.error({
        title: 'Error validating service config',
        description: error.message,
        placement: 'bottomLeft',
      });
    },
  });
  const handleValidateDeployment = () => {
    validateDeployment({
      serviceName,
      instanceName: serviceInstanceName,
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.deployment_read}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleValidateDeployment();
                trigger.props.onClick?.(event);
              },
              loading: isPending,
            })
          ) : (
            <Tooltip
              destroyOnHidden
              title={`Validate ${serviceName}/${serviceInstanceName}`}
            >
              <Button
                type="default"
                shape="circle"
                size="small"
                aria-label={`Validate ${serviceName}/${serviceInstanceName}`}
                icon={<IconBadge />}
                onClick={() => handleValidateDeployment()}
                loading={isPending}
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
              onClick: undefined,
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                size="small"
                disabled
                aria-label={`Validate ${serviceName}/${serviceInstanceName}`}
                icon={<IconBadge />}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        destroyOnHidden
        title={formatModalTitle({
          serviceName,
          serviceInstanceName,
        })}
        open={open}
        onCancel={() => setOpen(false)}
        classNames={{ body: 'pt-0' }}
        footer={null}
      >
        {data && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              {data.valid ? (
                <>
                  <IconCircleCheck className="text-success text-lg" /> Service
                  deployment is valid
                </>
              ) : (
                <>
                  <IconCircleX className="text-error text-lg" /> Service
                  deployment is invalid
                </>
              )}
            </span>
            <p>Errors: {data.errors?.length || 0}</p>
            {data.errors?.map((error, index) => (
              <NotificationCard
                key={`error-${index}`}
                description={error}
                type="error"
              />
            ))}
          </div>
        )}
        {error && (
          <NotificationCard
            title="Unexpected error validating deployment"
            description={error.message}
            type="error"
          />
        )}
      </Modal>
    </>
  );
};
