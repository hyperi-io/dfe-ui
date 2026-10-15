import { GitEnabledPendingReviewModal } from '@/core/components/GitEnabledPendingReviewModal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { App, Button } from 'antd';
import { useState } from 'react';

export const ResetAccountPasswordProgressiveDisclosure = ({
  username,
  onSuccess,
}: {
  username: string;
  onSuccess?: () => void;
}) => {
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { notification } = App.useApp();

  const {
    data,
    mutate: resetPassword,
    isPending,
    error,
  } = useAccountResetPassword({
    username,
    onSuccess: () => {
      notification.success({
        title: 'Password reset successfully',
        placement: 'bottomLeft',
      });
      setResetSuccess(true);
      setShowResetPasswordForm(false);
      onSuccess?.();
    },
  });

  const handleFinish = ({ new_password }: TResetPasswordFormValues) => {
    resetPassword({
      new_password,
    });
  };

  return (
    <>
      {showResetPasswordForm ? (
        <ResetPasswordForm
          onFinish={handleFinish}
          error={error}
          isPending={isPending}
          submitText="Reset Password"
          onCancel={() => setShowResetPasswordForm(false)}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {resetSuccess && (
            <NotificationCard
              className="w-full"
              description="Password reset successfully"
              type="success"
            />
          )}
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-semibold">Reset password</h3>
            <RbacProtected
              action={RbacProtected.rbacActions.accounts_reset_password}
            >
              <RbacProtected.Unrestricted>
                <Button
                  htmlType="button"
                  type="default"
                  className="ml-auto"
                  onClick={() => setShowResetPasswordForm(true)}
                >
                  Reset Password
                </Button>
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted>
                <Button
                  htmlType="button"
                  type="default"
                  className="ml-auto"
                  disabled
                >
                  Reset Password
                </Button>
              </RbacProtected.Restricted>
            </RbacProtected>
          </div>
          <p className="text-sm text-foreground/50 dark:text-dark-foreground/50 mb-2">
            Set a new password for this account. This does not change group
            memberships.
          </p>
        </div>
      )}

      <GitEnabledPendingReviewModal pending={data?.git.pending} />
    </>
  );
};
