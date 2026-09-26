import type { TCurrentUserResetPasswordResponse } from '@/core/hooks/useCurrentUserResetPassword/types';

export type TPendingReview = NonNullable<
  TCurrentUserResetPasswordResponse['git']['pending']
>;

const KEY_PREFIX = 'dfe_pending_review:';

export const pendingReviewStorageKey = (username: string) =>
  `${KEY_PREFIX}${username}`;

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

// Every access is guarded: storage can be absent or throw (private windows, blocked site data), and the page must work without it.

/** The merge instruction a password change on this browser was given, or null. */
export const readPendingReview = (username: string): TPendingReview | null => {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(pendingReviewStorageKey(username));
  } catch {
    return null;
  }
  if (raw === null) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const record = parsed as Record<string, unknown>;
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
  try {
    window.localStorage.setItem(pendingReviewStorageKey(username), value);
  } catch {
    // Unsaved, a reload shows the waiting state instead of the instruction.
  }
};

export const clearPendingReview = (username: string): void => {
  try {
    window.localStorage.removeItem(pendingReviewStorageKey(username));
  } catch {
    // Storage that throws cannot be read back either, so nothing is left to show.
  }
};
