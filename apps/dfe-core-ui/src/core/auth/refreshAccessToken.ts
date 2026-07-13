'use client';

import {
  getAccessTokenRefreshInFlight,
  trackAccessTokenRefresh,
} from '@/core/auth/accessTokenRefreshFlight';
import { loadSession } from '@/core/auth/cachedSession';
import { persistRefreshedSession } from '@/core/auth/persistRefreshedSession';
import { refreshToken } from '@/core/hooks/useRefreshToken/api';
import type { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { useAuthStore } from '@/core/stores/authStore';

/** Single deduped refresh: engine token → NextAuth JWT → client caches. */
export function executeAccessTokenRefresh(): Promise<TRefreshTokenResponse> {
  const inFlight = getAccessTokenRefreshInFlight();
  if (inFlight) {
    return inFlight as Promise<TRefreshTokenResponse>;
  }

  return trackAccessTokenRefresh(
    (async (): Promise<TRefreshTokenResponse> => {
      const tokenResponse = await refreshToken();
      await persistRefreshedSession(tokenResponse);
      const session = await loadSession({ force: true });
      useAuthStore.setState({
        session,
        sessionLastFetchedAt: Date.now(),
      });
      return tokenResponse;
    })(),
  );
}
