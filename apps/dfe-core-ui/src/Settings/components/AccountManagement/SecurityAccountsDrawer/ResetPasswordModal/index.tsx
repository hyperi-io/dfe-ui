import { GitEnabledPendingReviewModal } from '@/core/components/GitEnabledPendingReviewModal';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { Tooltip } from '@/core/components/Tooltip';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const ResetPasswordModal = ({
  username,
  disabledReason,
}: {
  username: string;
  /** Why this account's password cannot be reset, shown on the disabled button. */
  disabledReason?: string;
}) => {
  const [open, setOpen] = useState(false);

  const { notification } = App.useApp();

  const close = () => {
    setOpen(false);
  };

  const { data, mutate, isPending, error, reset } = useAccountResetPassword({
    username: username,
    onSuccess: () => {
      notification.success({
        title: `${username} password reset successfully`,
        placement: 'bottomLeft',
      });
      close();
    },
  });

  const onFinish = ({ new_password }: TResetPasswordFormValues) => {
    mutate({
      new_password,
    });
  };

  const openForm = () => {
    reset();
    setOpen(true);
  };

  if (disabledReason) {
    return (
      <Tooltip title={disabledReason}>
        <Button type="primary" icon={<IconRefresh />} disabled>
          Reset Password
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.accounts_reset_password}>
        <RbacProtected.Unrestricted>
          <Button type="primary" icon={<IconRefresh />} onClick={openForm}>
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
        title={`Reset Password for ${username}`}
        open={open}
        onClose={close}
        footer={null}
        destroyOnHidden
      >
        <ResetPasswordForm
          id={`${username}-reset-password-form`}
          onFinish={onFinish}
          error={error}
          isPending={isPending}
          submitText="Reset Password"
        />
      </Modal>

      <GitEnabledPendingReviewModal
        pending={data?.git.pending}
        onCancel={close}
      />
    </>
  );
};
