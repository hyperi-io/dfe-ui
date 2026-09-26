'use client';

import { executeAccessTokenRefresh } from '@/core/auth/refreshAccessToken';
import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import type { TCurrentUserResetPasswordResponse } from '@/core/hooks/useCurrentUserResetPassword/types';
import { useLogout } from '@/core/hooks/useLogout';
import '@/core/scenes/LoginScene/Login.css';
import { navigateWithReload } from '@/core/utils/navigation';
import { cn } from '@/core/utils/style';
import { IconLogout, IconPrimaryLogoFull } from '@repo/dfe-icons';
import { Alert, Button } from 'antd';
import { useState } from 'react';

type TPendingReview = NonNullable<
  TCurrentUserResetPasswordResponse['git']['pending']
>;

const PendingReview = ({
  pending,
  onContinue,
}: {
  pending: TPendingReview;
  onContinue: () => void;
}) => (
  <div className="flex flex-col gap-3 w-full">
    <Alert
      type="warning"
      showIcon
      title="Merge the review to keep this password"
      description="This deployment reviews account changes. The new password works now, but a restart before the review merges brings back the issued one."
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
      <Button type="primary" onClick={onContinue}>
        Continue
      </Button>
    </div>
  </div>
);

export const ChangePasswordScene = () => {
  // The plain login, never back here: the flag brings a flagged sign-in to this screen, and an unflagged one must not land on it.
  const { handleLogout } = useLogout({ callbackUrl: '/login' });
  const [pending, setPending] = useState<TPendingReview | null>(null);
  const [renewError, setRenewError] = useState<Error | null>(null);

  // A full load: a client navigation reached here through a redirect is deduped and never leaves.
  const enterConsole = () => {
    navigateWithReload('/');
  };

  const {
    mutate: changePassword,
    reset: clearChangeError,
    isPending,
    error,
  } = useCurrentUserResetPassword({
    onSuccess: async (data) => {
      // The session was issued without the account's standing, and a refresh carries it.
      try {
        await executeAccessTokenRefresh();
      } catch {
        setRenewError(
          new Error(
            'Your password is changed, but this session could not be renewed. Log out and sign in with the new password.',
          ),
        );
        return;
      }
      if (!data.git.merged && data.git.pending) {
        setPending(data.git.pending);
        return;
      }
      enterConsole();
    },
  });

  const onFinish = ({ new_password }: TResetPasswordFormValues) => {
    changePassword({ new_password });
  };

  const logout = (
    <Button
      type="text"
      className="px-0"
      icon={<IconLogout />}
      onClick={handleLogout}
    >
      Log out
    </Button>
  );

  return (
    <main
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center px-4',
        'bg-tertiary bg-linear-to-r from-tertiary via-secondary to-brand-primary bg-size-[200%_200%]',
      )}
      style={{
        animation: 'gradient 20s ease infinite',
      }}
    >
      <div className="bg-background rounded-lg p-4 shadow-lg text-foreground w-full max-w-[28rem] flex flex-col items-center gap-4">
        <IconPrimaryLogoFull
          className={cn('m-auto', 'text-brand-primary')}
          height={30}
          width={150}
        />
        <div className="w-full flex flex-col gap-1">
          <h1 className="text-lg font-medium">
            {pending ? 'Password set' : 'Set your own password'}
          </h1>
          {!pending && (
            <p className="text-sm text-foreground-muted">
              You signed in with the password this deployment issued. Choose
              your own, at least 12 characters, to continue. The issued password
              stops working once you do.
            </p>
          )}
        </div>

        {pending ? (
          <PendingReview pending={pending} onContinue={enterConsole} />
        ) : (
          <ResetPasswordForm
            id="change-password-form"
            onFinish={onFinish}
            onValuesChange={() => clearChangeError()}
            error={error ?? renewError}
            isPending={isPending}
            submitText="Set password"
            secondaryAction={logout}
          />
        )}
      </div>
    </main>
  );
};
