import type { TCurrentUserResetPasswordResponse } from '@/core/hooks/useCurrentUserResetPassword/types';
import {
  readStorageJson,
  removeStorageItem,
  writeStorageItem,
} from '@/core/utils/storage';

export type TPendingReview = NonNullable<
  TCurrentUserResetPasswordResponse['git']['pending']
>;

const KEY_PREFIX = 'dfe_pending_review:';

export const pendingReviewStorageKey = (username: string) =>
  `${KEY_PREFIX}${username}`;

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** The merge instruction a password change on this browser was given, or null. */
export const readPendingReview = (username: string): TPendingReview | null => {
  const record = readStorageJson(pendingReviewStorageKey(username), isRecord);
  if (record === null) {
    return null;
  }
  const pending = {
    pr_url: nonEmpty(record.pr_url),
    command: nonEmpty(record.command),
    branch: nonEmpty(record.branch),
  };
  return pending.pr_url || pending.command ? pending : null;
};

/** Keeps the merge instruction across a reload. Only these three fields are written. */
export const savePendingReview = (
  username: string,
  pending: TPendingReview,
): void => {
  const value = JSON.stringify({
    pr_url: nonEmpty(pending.pr_url),
    command: nonEmpty(pending.command),
    branch: nonEmpty(pending.branch),
  });
  // Where the write fails, a reload shows the waiting state instead of the instruction.
  writeStorageItem(pendingReviewStorageKey(username), value);
};

export const clearPendingReview = (username: string): void => {
  removeStorageItem(pendingReviewStorageKey(username));
};
