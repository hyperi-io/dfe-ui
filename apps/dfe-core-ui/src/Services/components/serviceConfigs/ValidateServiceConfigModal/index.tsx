import { useValidateServiceConfig } from '@/Services/hooks/serviceConfigs/useValidateServiceConfig';
import { NotificationCard } from '@/core/components/NotificationCard';

import { RbacProtected } from '@/core/components/RbacProtected';
import { IconBadge, IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { App, Button, ButtonProps, Modal, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';

interface ValidateServiceConfigDrawerProps {
  serviceConfigName: string;
  serviceConfigInstanceName: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

const formatModalTitle = ({
  serviceConfigName,
  serviceConfigInstanceName,
}: {
  serviceConfigName: string;
  serviceConfigInstanceName: string;
}) => {
  return `Validate ${serviceConfigName}/${serviceConfigInstanceName}`;
};

export const ValidateServiceConfigModal = ({
  serviceConfigName,
  serviceConfigInstanceName,
  onSuccess,
  trigger,
}: ValidateServiceConfigDrawerProps) => {
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const {
    data,
    mutate: validateServiceConfig,
    isPending,
    error,
  } = useValidateServiceConfig({
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
  const handleValidateServiceConfig = () => {
    validateServiceConfig({
      service_name: serviceConfigName,
      service_instance: serviceConfigInstanceName,
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.service_validate}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleValidateServiceConfig();
                trigger.props.onClick?.(event);
              },
              loading: isPending,
            })
          ) : (
            <Tooltip
              destroyOnHidden
              title={`Validate ${serviceConfigName}/${serviceConfigInstanceName}`}
            >
              <Button
                type="default"
                shape="circle"
                size="small"
                aria-label={`Validate ${serviceConfigName}/${serviceConfigInstanceName}`}
                icon={<IconBadge />}
                onClick={() => handleValidateServiceConfig()}
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
                aria-label={`Validate ${serviceConfigName}/${serviceConfigInstanceName}`}
                icon={<IconBadge />}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        destroyOnHidden
        title={formatModalTitle({
          serviceConfigName,
          serviceConfigInstanceName,
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
                  config is valid
                </>
              ) : (
                <>
                  <IconCircleX className="text-error text-lg" /> Service config
                  is invalid
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
            title="Unexpected error validating service config"
            description={error.message}
            type="error"
          />
        )}
      </Modal>
    </>
  );
};
