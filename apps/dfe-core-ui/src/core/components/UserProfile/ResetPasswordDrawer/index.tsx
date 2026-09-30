import { Drawer } from '@/core/components/Drawer';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { Tooltip } from '@/core/components/Tooltip';
import { loginWithNotice } from '@/core/config/loginNotice';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';

import { Button } from 'antd';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export const ResetPasswordDrawer = () => {
  const [open, setOpen] = useState(false);
  const {
    data: { external: externalUser } = {},
    isLoading,
    error,
  } = useFetchCurrentUser();

  const {
    mutate: resetPassword,
    reset: clearResetError,
    isPending: isResetPasswordPending,
    error: resetPasswordError,
  } = useCurrentUserResetPassword({
    // The engine ends every session of the account on a change, this one included.
    onSuccess: () => {
      void signOut({ callbackUrl: loginWithNotice('password-changed') });
    },
  });

  const onFinish = ({
    current_password = '',
    new_password,
  }: TResetPasswordFormValues) => {
    resetPassword({
      current_password,
      new_password,
    });
  };

  return (
    <>
      {!isLoading && !error ? (
        <>
          {externalUser && (
            <Tooltip title="External users cannot reset their password">
              <Button type="primary" disabled={externalUser}>
                Reset Password
              </Button>
            </Tooltip>
          )}
          {!externalUser && (
            <Button type="primary" onClick={() => setOpen(true)}>
              Reset Password
            </Button>
          )}
        </>
      ) : (
        <Button type="primary" loading={true} disabled={true}>
          Reset Password
        </Button>
      )}

      <Drawer title="Reset Password" open={open} onClose={() => setOpen(false)}>
        <ResetPasswordForm
          askCurrentPassword
          onFinish={onFinish}
          onValuesChange={() => clearResetError()}
          error={resetPasswordError}
          isPending={isResetPasswordPending}
          submitText="Reset Password"
        />
      </Drawer>
    </>
  );
};
