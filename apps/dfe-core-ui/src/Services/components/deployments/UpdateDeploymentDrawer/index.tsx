import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { UpdateDeploymentForm } from '@/Services/components/deployments/UpdateDeploymentForm';
import { TDeploymentDetailResponse } from '@/Services/hooks/deployments/useFetchDeploymentDetail/types';
import { TDeploymentUpdateResponse } from '@/Services/hooks/deployments/useUpdateDeployment/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps } from 'antd';
import { cloneElement, useState } from 'react';

interface UpdateDeploymentDrawerProps {
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
  onSuccess?: (deployment: TDeploymentUpdateResponse) => void;
  serviceDeployment: TDeploymentDetailResponse;
}

export const UpdateDeploymentDrawer = ({
  open,
  onClose,
  trigger,
  onSuccess,
  serviceDeployment: { config, service, instance },
}: UpdateDeploymentDrawerProps) => {
  const title = 'Update Deployment';

  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const handleOnSuccess = (response: TDeploymentUpdateResponse) => {
    setIsDrawerVisible(false);
    onClose?.();
    onSuccess?.(response);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.deployment_write}>
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
        <UpdateDeploymentForm
          serviceDeployment={{ config, service, instance }}
          onSuccess={handleOnSuccess}
        />
      </Drawer>
    </>
  );
};
