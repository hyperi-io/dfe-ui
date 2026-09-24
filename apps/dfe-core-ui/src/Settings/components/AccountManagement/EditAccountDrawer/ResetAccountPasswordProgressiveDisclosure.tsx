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
        />
      ) : (
        <div className="flex flex-col gap-2 items-center">
          {resetSuccess && (
            <NotificationCard
              className="w-full"
              description="Password reset successfully"
              type="success"
            />
          )}
          <RbacProtected
            action={RbacProtected.rbacActions.accounts_reset_password}
          >
            <RbacProtected.Unrestricted>
              <Button
                htmlType="button"
                type="primary"
                className="ml-auto"
                onClick={() => setShowResetPasswordForm(true)}
              >
                Reset Password
              </Button>
            </RbacProtected.Unrestricted>
            <RbacProtected.Restricted>
              <Button
                htmlType="button"
                type="primary"
                className="ml-auto"
                disabled
              >
                Reset Password
              </Button>
            </RbacProtected.Restricted>
          </RbacProtected>
        </div>
      )}
    </>
  );
};
