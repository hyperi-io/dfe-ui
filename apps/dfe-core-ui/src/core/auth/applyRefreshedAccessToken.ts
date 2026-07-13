import type { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';

import { getCachedSession, setCachedSession } from './cachedSession';

/** Updates the in-memory session cache before NextAuth `update()` finishes. */
export const applyRefreshedAccessToken = (
  tokenResponse: TRefreshTokenResponse,
): void => {
  const current = getCachedSession();
  if (!current?.user) {
    return;
  }

  setCachedSession({
    ...current,
    error: undefined,
    accessTokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
    user: {
      ...current.user,
      accessToken: tokenResponse.access_token,
      roles: tokenResponse.roles ?? current.user.roles,
    },
  });
};
