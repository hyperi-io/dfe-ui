import { Drawer } from '@/core/components/Drawer';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { Tooltip } from '@/core/components/Tooltip';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';

import { App, Button } from 'antd';
import { useState } from 'react';

export const ResetPasswordDrawer = () => {
  const [open, setOpen] = useState(false);
  const {
    data: { external: externalUser } = {},
    isLoading,
    error,
  } = useFetchCurrentUser();

  const { notification } = App.useApp();
  const {
    mutate: resetPassword,
    isPending: isResetPasswordPending,
    error: resetPasswordError,
  } = useCurrentUserResetPassword({
    onSuccess: () => {
      notification.success({
        title: 'Password reset successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const onFinish = ({ new_password }: TResetPasswordFormValues) => {
    resetPassword({
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
          onFinish={onFinish}
          error={resetPasswordError}
          isPending={isResetPasswordPending}
          submitText="Reset Password"
        />
      </Drawer>
    </>
  );
};
