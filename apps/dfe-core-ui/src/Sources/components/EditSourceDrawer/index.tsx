import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps, notification } from 'antd';
import { cloneElement, useState } from 'react';
import { EditSourceForm } from './EditSourceForm';

interface EditSourceDrawerProps {
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
  onSuccess?: (source: SourceUpdateResponse) => void;
}

export const EditSourceDrawer = ({
  open,
  onClose,
  trigger,
  onSuccess,
}: EditSourceDrawerProps) => {
  const title = 'Edit Source';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const handleOnSuccess = (response: SourceUpdateResponse) => {
    setIsDrawerVisible(false);
    onClose?.();
    onSuccess?.(response);
    api.success({
      title: `${response.source} updated successfully`,
      placement: 'bottomLeft',
    });
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.SOURCE_WRITE}>
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
        <RbacProtected.Restricted className="justify-start">
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
      >
        <EditSourceForm onSuccess={handleOnSuccess} />
      </Drawer>
    </>
  );
};
