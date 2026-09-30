'use client';

import { useAuthStore } from '@/core/stores/authStore';
import type { Session } from 'next-auth';
import {
  getAccessTokenRefreshInFlight,
  trackAccessTokenRefresh,
} from './accessTokenRefreshFlight';
import { setCachedSession } from './cachedSession';
import { renewSession } from './renewSession';

/** Single deduped renewal: the server refreshes the engine token into the NextAuth JWT, then client caches follow. */
export function executeAccessTokenRefresh(): Promise<Session> {
  const inFlight = getAccessTokenRefreshInFlight();
  if (inFlight) {
    return inFlight as Promise<Session>;
  }

  return trackAccessTokenRefresh(
    (async (): Promise<Session> => {
      const session = await renewSession();
      setCachedSession(session);
      useAuthStore.setState({
        session,
        sessionLastFetchedAt: Date.now(),
      });
      return session;
    })(),
  );
}
