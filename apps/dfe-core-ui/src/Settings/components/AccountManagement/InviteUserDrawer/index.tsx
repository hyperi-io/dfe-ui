import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { CreateAccountForm } from '@/core/components/CreateAccountForm';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';
import { IconSend } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const InviteUserDrawer = () => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();
  // The grant names the account it creates, so it is asked for at submit.
  const [reauthTarget, setReauthTarget] = useState('');
  const reauth = useReauthGrant(reauthTarget, 'account', 'create');

  const {
    mutate: createAccount,
    isPending,
    error,
  } = useCreateAccount({
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      setOpen(false);
      notification.success({
        title: 'Account created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleCreate = (values: Parameters<typeof createAccount>[0]) => {
    setReauthTarget(values.username);
    reauth.ask(() => createAccount(values));
  };

  return (
    <>
      {reauth.modal}
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
          onFinish={handleCreate}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
