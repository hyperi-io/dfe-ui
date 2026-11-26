import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Drawer, TABBED_DRAWER_STYLES } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { UpdateAccountForm } from '@/Settings/components/AccountManagement/UpdateAccountForm';
import { UpdateAccountOrgForm } from '@/Settings/components/AccountManagement/UpdateAccountOrgForm';
import { useUpdateAccount } from '@/Settings/hooks/accounts/useUpdateAccount';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, notification, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ResetAccountPasswordDrawer } from './ResetAccountPasswordDrawer';

export const EditAccountDrawer = ({
  username,
  isExternal,
}: {
  username: string;
  isExternal: boolean;
}) => {
  const { data: currentUser } = useFetchCurrentUser();
  const [open, setOpen] = useState(false);
  const reauth = useReauthGrant(username);
  const [api, contextHolder] = notification.useNotification();
  const title = `Edit ${username}`;

  const queryClient = useQueryClient();

  const handleClose = () => {
    setOpen(false);
    reauth.drop();
  };

  const onSuccess = () => {
    handleClose();

    api.success({
      title: 'Account updated successfully',
      placement: 'bottomLeft',
    });
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.accounts.account({ username }),
    });
  };
  const {
    mutate: mutateAccount,
    isPending,
    error,
    reset: resetAccount,
  } = useUpdateAccount({ reauth: reauth.grant, username, onSuccess });
  // Its own mutation, so a failed org change shows only on the Organisation tab.
  const {
    mutate: mutateOrg,
    isPending: isOrgPending,
    error: orgError,
    reset: resetOrg,
  } = useUpdateAccount({ reauth: reauth.grant, username, onSuccess });

  // The engine asks for the password only when the change needs it.
  const updateAccount = (body: Parameters<typeof mutateAccount>[0]) =>
    mutateAccount(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => mutateAccount(body))) {
          resetAccount();
        }
      },
    });
  const updateOrg = (body: Parameters<typeof mutateOrg>[0]) =>
    mutateOrg(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => mutateOrg(body))) {
          resetOrg();
        }
      },
    });

  const router = useRouter();
  // Your own password changes on your profile, which asks for the current one.
  const resetPassword =
    username === currentUser?.username ? (
      <Button onClick={() => router.push('/account?reset_password=true')}>
        Reset Password
      </Button>
    ) : isExternal ? (
      <Tooltip title="Its identity provider holds this account's password">
        <span>
          <Button disabled>Reset Password</Button>
        </span>
      </Tooltip>
    ) : (
      <ResetAccountPasswordDrawer username={username} />
    );

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

      {reauth.modal}

      <Drawer
        title={title}
        open={open}
        onClose={handleClose}
        styles={TABBED_DRAWER_STYLES}
      >
        <Tabs
          items={[
            {
              key: 'details',
              label: 'Details',
              children: (
                <UpdateAccountForm
                  actions={resetPassword}
                  username={username}
                  onFinish={updateAccount}
                  error={error}
                  isPending={isPending}
                />
              ),
            },
            {
              key: 'organisation',
              label: 'Organisation',
              children: (
                <UpdateAccountOrgForm
                  error={orgError}
                  isPending={isOrgPending}
                  onFinish={updateOrg}
                  username={username}
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};
