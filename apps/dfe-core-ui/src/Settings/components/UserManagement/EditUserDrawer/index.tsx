import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ResetUserPasswordForm } from '@/Settings/components/UserManagement/EditUserDrawer/ResetUserPasswordForm';
import { UpdateUserForm } from '@/Settings/components/UserManagement/EditUserDrawer/UpdateUserForm';
import { useUpdateAccount } from '@/Settings/hooks/useUpdateAccount';
import { IconEdit } from '@repo/dfe-icons';
import { Button, Divider, notification } from 'antd';
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
      <RbacProtected action={RbacProtected.rbacActions.account_write}>
        <RbacProtected.Unrestricted>
          <Button
            aria-label={title}
            type="text"
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit User
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button
            aria-label={title}
            type="text"
            disabled
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit User
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-2">
          <UpdateUserForm
            username={username}
            onFinish={updateAccount}
            error={error}
            isPending={isPending}
          />
          <Divider className="my-2" />
          <h3 className="text-base font-semibold">Reset password</h3>
          <p className="text-sm text-foreground/50 dark:text-dark-foreground/50 mb-2">
            Set a new password for this account. This does not change group
            memberships.
          </p>
          <ResetUserPasswordForm username={username} />
        </div>
      </Drawer>
    </>
  );
};
