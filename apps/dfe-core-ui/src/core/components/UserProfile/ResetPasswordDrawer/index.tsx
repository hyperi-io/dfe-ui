import { Drawer } from '@/core/components/Drawer';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { Tooltip } from '@/core/components/Tooltip';
import { loginWithNotice } from '@/core/config/loginNotice';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';

import { GitEnabledPendingReviewModal } from '@/core/components/GitEnabledPendingReviewModal';
import { Button } from 'antd';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const ResetPasswordDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resetPasswordParam = searchParams.get('reset_password') === 'true';
  const [open, setOpen] = useState(resetPasswordParam);

  const handleClose = () => {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('reset_password');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };
  const {
    data: { external: externalUser } = {},
    isLoading,
    error,
  } = useFetchCurrentUser();

  useEffect(() => {
    if (resetPasswordParam) {
      queueMicrotask(() => setOpen(true));
    }
  }, [resetPasswordParam]);

  const {
    data,
    mutate: resetPassword,
    reset: clearResetError,
    isPending: isResetPasswordPending,
    error: resetPasswordError,
  } = useCurrentUserResetPassword({
    // The engine ends every session of the account on a change, this one included.
    onSuccess: ({ git }) => {
      const held =
        !git.merged &&
        Boolean(
          git.pending?.command || git.pending?.pr_url || git.pending?.branch,
        );
      if (held) {
        return;
      }
      handleClose();
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

      <Drawer title="Reset Password" open={open} onClose={handleClose}>
        <ResetPasswordForm
          askCurrentPassword
          onFinish={onFinish}
          onValuesChange={() => clearResetError()}
          error={resetPasswordError}
          isPending={isResetPasswordPending}
          submitText="Reset Password"
        />
      </Drawer>

      <GitEnabledPendingReviewModal pending={data?.git.pending} />
    </>
  );
};
