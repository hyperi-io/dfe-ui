'use client';

import { executeAccessTokenRefresh } from '@/core/auth/refreshAccessToken';
import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import {
  ResetPasswordForm,
  TResetPasswordFormValues,
} from '@/core/components/ResetPasswordForm';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import type { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useLogout } from '@/core/hooks/useLogout';
import '@/core/scenes/LoginScene/Login.css';
import { navigateWithReload } from '@/core/utils/navigation';
import { cn } from '@/core/utils/style';
import { IconLogout, IconPrimaryLogoFull } from '@repo/dfe-icons';
import { Alert, Button, Spin } from 'antd';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  clearPendingReview,
  readPendingReview,
  savePendingReview,
  type TPendingReview,
} from './pendingReviewStorage';

type TReviewState = 'unmerged' | 'settled' | 'unknown';

// setup-status reports the local admin only, and never the merge instruction itself.
const reviewStateFor = (
  status: TFetchSetupStatusResponse | undefined,
  username: string,
): TReviewState => {
  if (!status) {
    return 'unknown';
  }
  const git = status.break_glass;
  const unmerged =
    status.admin_username === username &&
    git?.enabled === true &&
    git.committed &&
    !git.merged;
  return unmerged ? 'unmerged' : 'settled';
};

type TView =
  | { kind: 'loading' }
  | { kind: 'form' }
  | { kind: 'review'; pending: TPendingReview | null }
  | { kind: 'completed' };

const PendingReview = ({
  pending,
  onContinue,
  secondaryAction,
}: {
  pending: TPendingReview | null;
  onContinue: () => void;
  secondaryAction: ReactNode;
}) => (
  <div className="flex flex-col gap-3 w-full">
    {pending ? (
      <Alert
        type="warning"
        showIcon
        title="Merge the review to keep this password"
        description="This deployment reviews account changes. The new password works now, but a restart before the review merges brings back the issued one."
      />
    ) : (
      <Alert
        type="warning"
        showIcon
        title="A merge is still needed to keep this password"
        description="The new password works now, but the deploy repo has not merged it, and a restart before it does brings back the issued one. Run the merge command shown when the password was set, or ask whoever runs the deploy repo to merge the account review."
      />
    )}
    {pending?.pr_url && (
      <a href={pending.pr_url} target="_blank" rel="noreferrer">
        Open the review
      </a>
    )}
    {pending && !pending.pr_url && pending.command && (
      <CopyCodeBlock code={pending.command} />
    )}
    <div className="flex items-center justify-between">
      {secondaryAction}
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
  const { data: me, isLoading: isLoadingMe } = useAuthMe();
  const {
    data: setupStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useFetchSetupStatus();
  const username = me?.user_id ?? '';
  // Read once per account, so clearing it on the way out does not flash the form.
  const stored = useMemo(
    () => (username ? readPendingReview(username) : null),
    [username],
  );

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
        // setup-status cannot hand the instruction back after a reload, so this browser keeps it.
        if (username) {
          savePendingReview(username, data.git.pending);
        }
        setPending(data.git.pending);
        return;
      }
      if (username) {
        clearPendingReview(username);
      }
      enterConsole();
    },
  });

  const resolveView = (): TView => {
    if (pending) {
      return { kind: 'review', pending };
    }
    if (isLoadingMe || isLoadingStatus) {
      return { kind: 'loading' };
    }
    // An account the engine still holds to an issued password has one thing to do here.
    if (!username || me?.password_change_required) {
      return { kind: 'form' };
    }
    // A failed status call is not a merge, so a stored instruction stays on screen.
    const review = statusError
      ? 'unknown'
      : reviewStateFor(setupStatus, username);
    if (review === 'unmerged') {
      return { kind: 'review', pending: stored };
    }
    if (stored) {
      return review === 'unknown'
        ? { kind: 'review', pending: stored }
        : { kind: 'completed' };
    }
    return { kind: 'form' };
  };
  const view = resolveView();

  useEffect(() => {
    if (view.kind !== 'completed') {
      return;
    }
    clearPendingReview(username);
    navigateWithReload('/');
  }, [view.kind, username]);

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
        {view.kind === 'loading' || view.kind === 'completed' ? (
          <Spin />
        ) : (
          <>
            <div className="w-full flex flex-col gap-1">
              <h1 className="text-lg font-medium">
                {view.kind === 'review'
                  ? 'Password set'
                  : 'Set your own password'}
              </h1>
              {view.kind === 'form' && (
                <p className="text-sm text-foreground-muted">
                  You signed in with the password this deployment issued. Choose
                  your own, at least 12 characters, to continue. The issued
                  password stops working once you do.
                </p>
              )}
            </div>

            {view.kind === 'review' ? (
              <PendingReview
                pending={view.pending}
                onContinue={enterConsole}
                secondaryAction={logout}
              />
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
          </>
        )}
      </div>
    </main>
  );
};
