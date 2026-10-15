import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { UpdateAccountForm } from '@/Settings/components/AccountManagement/UpdateAccountForm';
import { ACCOUNT_DETAIL_QUERY_KEY } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import { useUpdateAccount } from '@/Settings/hooks/accounts/useUpdateAccount';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Divider, notification } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { ResetAccountPasswordProgressiveDisclosure } from './ResetAccountPasswordProgressiveDisclosure';

export const EditAccountDrawer = ({
  username,
  isExternal,
}: {
  username: string;
  isExternal: boolean;
}) => {
  const { data: currentUser } = useFetchCurrentUser();
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const title = `Edit ${username}`;

  const queryClient = useQueryClient();

  const {
    mutate: updateAccount,
    isPending,
    error,
  } = useUpdateAccount({
    username,
    onSuccess: () => {
      setOpen(false);

      api.success({
        title: 'Account updated successfully',
        placement: 'bottomLeft',
      });
      void queryClient.invalidateQueries({
        queryKey: ACCOUNT_DETAIL_QUERY_KEY(username),
      });
    },
  });

  const isEditingOwnAccountPassword = username === currentUser?.username;

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
            Edit Account
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            aria-label={title}
            type="text"
            disabled
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit Account
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-2">
          {isEditingOwnAccountPassword ? (
            <>
              <h3 className="text-base font-semibold">Reset password</h3>
              <NotificationCard
                description={
                  <div className="flex gap-2">
                    <p>Please update your password from your user profile.</p>
                    <Link href={`/account`}>Go to profile</Link>
                  </div>
                }
              />
            </>
          ) : (
            <RbacProtected
              action={RbacProtected.rbacActions.accounts_reset_password}
            >
              <RbacProtected.Unrestricted>
                {!isExternal && (
                  <ResetAccountPasswordProgressiveDisclosure
                    username={username}
                  />
                )}
                {isExternal && (
                  <NotificationCard
                    className="w-full"
                    title="Cannot reset password for external users"
                    description="Password is managed by the external OIDC provider"
                    type="warning"
                  />
                )}
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted>
                <NotificationCard
                  className="w-full"
                  title="You do not have permission to reset the password for this account."
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          )}

          <Divider className="my-2" />

          <UpdateAccountForm
            username={username}
            onFinish={updateAccount}
            error={error}
            isPending={isPending}
          />
        </div>
      </Drawer>
    </>
  );
};
