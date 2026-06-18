const DEFAULT_ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const DEFAULT_SESSION_CHECK_INTERVAL_MS = 60 * 1000;
const DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS = 5 * 60;

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
): number => {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

/** Refresh the access token this long before it expires (also on focus via session refetch). */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_REFRESH_BUFFER_MS,
  DEFAULT_ACCESS_TOKEN_REFRESH_BUFFER_MS,
);

/** Minimum time between refresh API calls (avoids loops while session catches up). */
export const MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_MIN_REFRESH_INTERVAL_MS,
  DEFAULT_MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS,
);

/** How often AuthSessionMonitor re-evaluates whether a refresh is needed. */
export const SESSION_CHECK_INTERVAL_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_SESSION_CHECK_INTERVAL_MS,
  DEFAULT_SESSION_CHECK_INTERVAL_MS,
);

/** NextAuth SessionProvider poll interval (seconds). */
export const SESSION_REFETCH_INTERVAL_SECONDS = parsePositiveInt(
  process.env.NEXT_PUBLIC_SESSION_REFETCH_INTERVAL_SECONDS,
  DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS,
);

export const shouldRefreshAccessToken = ({
  accessTokenExpiresAt,
  sessionError,
  lastRefreshAttemptAt,
  knownExpiresAt,
}: {
  accessTokenExpiresAt?: number;
  sessionError?: 'AccessTokenExpired';
  lastRefreshAttemptAt?: number;
  /** Client-side expiry from the last successful refresh (session may lag behind). */
  knownExpiresAt?: number;
}): boolean => {
  if (
    typeof lastRefreshAttemptAt === 'number' &&
    Date.now() - lastRefreshAttemptAt < MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS
  ) {
    return false;
  }

  const effectiveExpiresAt = Math.max(
    accessTokenExpiresAt ?? 0,
    knownExpiresAt ?? 0,
  );

  if (
    effectiveExpiresAt > 0 &&
    Date.now() < effectiveExpiresAt - ACCESS_TOKEN_REFRESH_BUFFER_MS
  ) {
    return false;
  }

  if (sessionError === 'AccessTokenExpired') {
    return true;
  }

  if (effectiveExpiresAt <= 0) {
    return false;
  }

  return Date.now() >= effectiveExpiresAt - ACCESS_TOKEN_REFRESH_BUFFER_MS;
};
