import { Drawer } from '@/core/components/Drawer';
import { CreateAccountForm } from '@/Settings/components/UserManagement/CreateAccountForm';
import { useCreateAccount } from '@/Settings/hooks/useCreateAccount';
import { IconSend } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const InviteUserDrawer = ({ refetch }: { refetch: () => void }) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: createAccount,
    isPending,
    error,
  } = useCreateAccount({
    onSuccess: () => {
      setOpen(false);
      refetch();
      api.success({
        title: 'User created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  return (
    <>
      {contextHolder}
      <Button type="primary" icon={<IconSend />} onClick={() => setOpen(true)}>
        Invite New User
      </Button>
      <Drawer title="Create User" open={open} onClose={() => setOpen(false)}>
        <CreateAccountForm
          onFinish={createAccount}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
