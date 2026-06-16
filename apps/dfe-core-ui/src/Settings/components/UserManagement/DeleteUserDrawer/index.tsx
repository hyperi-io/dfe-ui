import { Drawer } from '@/core/components/Drawer';
import { IconTrash } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const DeleteUserDrawer = ({
  title = 'Delete user',
  isActive = true,
}: {
  title?: string;
  isActive: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleDelete = () => {
    // Only de-activate the user if they are inactive
    if (isActive) {
      api.error({
        title: 'User is active',
        description: 'Please de-activate them first.',
        placement: 'bottomLeft',
      });
      return;
    }
    // eslint-disable-next-line no-alert
    window.alert('User deleted successfully.');
  };
  return (
    <>
      {contextHolder}
      <Button
        aria-label={title}
        type="text"
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        danger
      >
        {title}
      </Button>
      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <div className="border border-error text-error bg-error/10 rounded-md p-4">
          Implement DeleteUserDrawer
        </div>
        <Button className="mt-4" type="primary" danger onClick={handleDelete}>
          Test Delete
        </Button>
      </Drawer>
    </>
  );
};
