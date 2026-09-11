import { NotificationCard } from '@/core/components/NotificationCard';
import { Button } from 'antd';
import { useState } from 'react';
import { ResetAccountPasswordForm } from './ResetAccountPasswordForm';

export const ResetAccountPassword = ({ username }: { username: string }) => {
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  return (
    <>
      {showResetPasswordForm ? (
        <ResetAccountPasswordForm
          username={username}
          onSuccess={() => {
            setShowResetPasswordForm(false);
            setResetSuccess(true);
          }}
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
          <Button
            htmlType="button"
            type="primary"
            className="ml-auto"
            onClick={() => setShowResetPasswordForm(true)}
          >
            Reset Password
          </Button>
        </div>
      )}
    </>
  );
};
