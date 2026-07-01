'use client';

import { loadSession } from '@/core/auth/cachedSession';
import { persistRefreshedSession } from '@/core/auth/persistRefreshedSession';
import {
  getAccessTokenRefreshInFlight,
  trackAccessTokenRefresh,
} from '@/core/auth/accessTokenRefreshFlight';
import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import type { RefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { useAuthStore } from '@/core/stores/authStore';

/** Single deduped refresh: engine token → NextAuth JWT → client caches. */
export function executeAccessTokenRefresh(): Promise<RefreshTokenResponse> {
  const inFlight = getAccessTokenRefreshInFlight();
  if (inFlight) {
    return inFlight as Promise<RefreshTokenResponse>;
  }

  return trackAccessTokenRefresh(
    (async (): Promise<RefreshTokenResponse> => {
      const tokenResponse = await apiClient.post(API_CONFIG.auth.refresh);
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
