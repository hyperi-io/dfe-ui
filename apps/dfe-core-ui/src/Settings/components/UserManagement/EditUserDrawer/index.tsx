import { Drawer } from '@/core/components/Drawer';
import { UpdateUserForm } from '@/Settings/components/UserManagement/EditUserDrawer/UpdateUserForm';
import { useUpdateAccount } from '@/Settings/hooks/useUpdateAccount';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const EditUserDrawer = ({
  username,
  refetch,
}: {
  username: string;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const title = `Edit ${username}`;

  const {
    mutate: updateAccount,
    isPending,
    error,
  } = useUpdateAccount({
    username,
    onSuccess: () => {
      setOpen(false);
      refetch();
      api.success({
        title: 'User updated successfully',
        placement: 'bottomLeft',
      });
    },
  });

  return (
    <>
      {contextHolder}
      <Button
        aria-label={title}
        type="text"
        icon={<IconEdit />}
        onClick={() => setOpen(true)}
      >
        Edit User
      </Button>
      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <UpdateUserForm
          username={username}
          onFinish={updateAccount}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
