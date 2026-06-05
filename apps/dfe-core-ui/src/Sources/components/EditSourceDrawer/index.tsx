import { Drawer } from '@/core/components/Drawer';
import { SourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps, notification } from 'antd';
import { cloneElement, useState } from 'react';
import { EditSourceForm } from './EditSourceForm';

interface EditSourceDrawerProps {
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const EditSourceDrawer = ({
  open,
  onClose,
  trigger,
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
    api.success({
      title: 'Source updated successfully',
      placement: 'bottomLeft',
      message: `${response.source} updated successfully`,
    });
  };

  return (
    <>
      {contextHolder}
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
