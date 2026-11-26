import { Drawer } from '@/core/components/Drawer';
import { GitEnabledPendingReviewModal } from '@/core/components/GitEnabledPendingReviewModal';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { App, Button } from 'antd';
import { useState } from 'react';

/** The Reset password row of an account's edit view, which sets a new password in a drawer of its own. */
export const ResetAccountPasswordDrawer = ({
  username,
  onSuccess,
}: {
  username: string;
  onSuccess?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();
  const reauth = useReauthGrant(username);

  const {
    data,
    mutate: resetPassword,
    reset: clearResetError,
    isPending,
    error,
  } = useAccountResetPassword({
    reauth: reauth.grant,
    username,
    onSuccess: () => {
      reauth.drop();
      notification.success({
        title: 'Password reset successfully',
        placement: 'bottomLeft',
      });
      setOpen(false);
      onSuccess?.();
    },
  });

  const handleClose = () => {
    clearResetError();
    setOpen(false);
  };

  const handleFinish = ({ new_password }: TResetPasswordFormValues) => {
    const body = { new_password };
    // The engine asks for the password only when the reset needs it.
    resetPassword(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => resetPassword(body))) {
          clearResetError();
        }
      },
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.accounts_reset_password}>
        <RbacProtected.Unrestricted>
          <Button
            htmlType="button"
            type="default"
            onClick={() => setOpen(true)}
          >
            Reset Password
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button htmlType="button" type="default" disabled>
            Reset Password
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={`Reset Password for ${username}`}
        open={open}
        onClose={handleClose}
      >
        <ResetPasswordForm
          onFinish={handleFinish}
          onValuesChange={() => clearResetError()}
          error={error}
          isPending={isPending}
          submitText="Reset Password"
          onCancel={handleClose}
        />
      </Drawer>

      {reauth.modal}
      <GitEnabledPendingReviewModal pending={data?.git.pending} />
    </>
  );
};
