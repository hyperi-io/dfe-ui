import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { Tooltip } from '@/core/components/Tooltip';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { TAccountResetPasswordResponse } from '@/core/hooks/useAccountResetPassword/types';
import { IconRefresh } from '@repo/dfe-icons';
import { Alert, App, Button } from 'antd';
import { useState } from 'react';

type TPendingReview = NonNullable<
  TAccountResetPasswordResponse['git']['pending']
>;

/** What the operator does to keep a password a review deployment has not merged yet. */
const PendingReview = ({
  pending,
  onDone,
}: {
  pending: TPendingReview;
  onDone: () => void;
}) => (
  <div className="flex flex-col gap-3 w-full">
    <Alert
      type="warning"
      showIcon
      title="Merge the review to keep this password"
      description="The new password works now. This deployment reviews account changes, so a restart before the review merges brings back the old one."
    />
    {pending.pr_url && (
      <a href={pending.pr_url} target="_blank" rel="noreferrer">
        Open the review
      </a>
    )}
    {!pending.pr_url && pending.command && (
      <CopyCodeBlock code={pending.command} />
    )}
    <div className="flex justify-end">
      <Button type="primary" onClick={onDone}>
        Done
      </Button>
    </div>
  </div>
);

export const ResetPasswordModal = ({
  username,
  disabledReason,
}: {
  username: string;
  /** Why this account's password cannot be reset, shown on the disabled button. */
  disabledReason?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<TPendingReview | null>(null);

  const { notification } = App.useApp();

  const close = () => {
    setOpen(false);
    setPending(null);
  };

  const { mutate, isPending, error, reset } = useAccountResetPassword({
    username: username,
    onSuccess: ({ git }) => {
      if (!git.merged && git.pending) {
        setPending(git.pending);
        return;
      }
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
        {pending ? (
          <PendingReview pending={pending} onDone={close} />
        ) : (
          <ResetPasswordForm
            id={`${username}-reset-password-form`}
            onFinish={onFinish}
            error={error}
            isPending={isPending}
            submitText="Reset Password"
          />
        )}
      </Modal>
    </>
  );
};
