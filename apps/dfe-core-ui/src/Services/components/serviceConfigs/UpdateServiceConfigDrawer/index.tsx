import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { UpdateServiceConfigForm } from '@/Services/components/serviceConfigs/UpdateServiceConfigForm';
import { TFetchServiceConfigDetailResponse } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail/types';
import { TServiceConfigUpdateResponse } from '@/Services/hooks/serviceConfigs/useUpdateServiceConfig/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps } from 'antd';
import { cloneElement, useState } from 'react';

interface UpdateServiceConfigDrawerProps {
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
  onSuccess?: (serviceConfig: TServiceConfigUpdateResponse) => void;
  serviceConfig: TFetchServiceConfigDetailResponse;
}

export const UpdateServiceConfigDrawer = ({
  open,
  onClose,
  trigger,
  onSuccess,
  serviceConfig: { config, service, instance },
}: UpdateServiceConfigDrawerProps) => {
  const title = 'Update Service Configuration';

  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const handleOnSuccess = (response: TServiceConfigUpdateResponse) => {
    setIsDrawerVisible(false);
    onClose?.();
    onSuccess?.(response);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.service_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setIsDrawerVisible(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              className="border border-tertiary text-tertiary"
              icon={<IconEdit className="text-tertiary" />}
              onClick={() => setIsDrawerVisible(true)}
            >
              {title}
            </Button>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="opacity-100 justify-start"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setIsDrawerVisible(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              disabled
              className="border border-tertiary text-tertiary"
              icon={<IconEdit className="text-tertiary" />}
              onClick={() => setIsDrawerVisible(true)}
            >
              {title}
            </Button>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
        classNames={{ body: 'pt-0' }}
      >
        <UpdateServiceConfigForm
          serviceConfig={{ config, service, instance }}
          onSuccess={handleOnSuccess}
        />
      </Drawer>
    </>
  );
};
