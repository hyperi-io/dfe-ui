import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const ResetPasswordModal = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false);

  const { notification } = App.useApp();

  const { mutate, isPending, error } = useAccountResetPassword({
    username: username,
    onSuccess: () => {
      notification.success({
        title: `${username} password reset successfully`,
        placement: 'bottomLeft',
      });
      setOpen(false);
    },
  });

  const onFinish = ({ new_password }: TResetPasswordFormValues) => {
    mutate({
      new_password,
    });
  };
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.accounts_reset_password}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconRefresh />}
            onClick={() => setOpen(true)}
          >
            Reset Password
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button type="primary" icon={<IconRefresh />} disabled>
            Reset Password
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Reset Password"
        open={open}
        onClose={() => setOpen(false)}
        footer={null}
      >
        <ResetPasswordForm
          id={`${username}-reset-password-form-${new Date().getTime()}`}
          onFinish={onFinish}
          error={error}
          isPending={isPending}
          submitText="Reset Password"
        />
      </Modal>
    </>
  );
};
