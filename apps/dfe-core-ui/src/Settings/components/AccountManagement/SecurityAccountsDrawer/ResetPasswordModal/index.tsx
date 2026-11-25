import { GitEnabledPendingReviewModal } from '@/core/components/GitEnabledPendingReviewModal';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { IconRefresh } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useId, useState } from 'react';

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

  // A security account's password is its recovery credential, so a reset asks for the caller's own password.
  const reauth = useReauthGrant(username, 'account', 'reset the password of');
  const { data, mutate, isPending, error, reset } = useAccountResetPassword({
    reauth: reauth.grant,
    username: username,
    onSuccess: () => {
      reauth.drop();
      notification.success({
        title: `${username} password reset successfully`,
        placement: 'bottomLeft',
      });
      close();
    },
  });

  const onFinish = ({ new_password }: TResetPasswordFormValues) => {
    const body = { new_password };
    mutate(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => mutate(body))) {
          reset();
        }
      },
    });
  };

  const openForm = () => {
    reset();
    setOpen(true);
  };

  const reasonId = useId();
  // The reason is visible text, since a disabled button takes no focus and its tooltip no keyboard.
  if (disabledReason) {
    return (
      <div className="flex flex-col items-start gap-1">
        <Button
          type="primary"
          icon={<IconRefresh />}
          disabled
          aria-describedby={reasonId}
        >
          Reset Password
        </Button>
        <p
          id={reasonId}
          className="text-xs text-foreground-muted dark:text-dark-foreground-muted"
        >
          {disabledReason}
        </p>
      </div>
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

      {reauth.modal}
      <GitEnabledPendingReviewModal
        pending={data?.git.pending}
        onCancel={close}
      />
    </>
  );
};
