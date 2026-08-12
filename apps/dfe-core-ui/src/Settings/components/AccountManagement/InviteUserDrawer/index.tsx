import { CreateAccountForm } from '@/core/components/CreateAccountForm';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';
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
        title: 'Account created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.account_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconSend />}
            onClick={() => setOpen(true)}
          >
            Invite New User
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button
            type="primary"
            icon={<IconSend />}
            disabled
            onClick={() => setOpen(true)}
          >
            Invite New User
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title="Create Account" open={open} onClose={() => setOpen(false)}>
        <CreateAccountForm
          onFinish={createAccount}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
