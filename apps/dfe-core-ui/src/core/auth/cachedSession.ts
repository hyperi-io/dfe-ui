import { SESSION_AUTH_REFRESH_INTERVAL_MS } from '@/core/config/authSession';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

let cachedSession: Session | null = null;
let lastFetchedAt: number | null = null;
let loadInFlight: Promise<Session | null> | null = null;

const isFresh = () =>
  lastFetchedAt != null &&
  Date.now() - lastFetchedAt < SESSION_AUTH_REFRESH_INTERVAL_MS;

export const getCachedSession = (): Session | null => cachedSession;

export const setCachedSession = (session: Session | null) => {
  cachedSession = session;
  lastFetchedAt = Date.now();
};

export const resetCachedSession = () => {
  cachedSession = null;
  lastFetchedAt = null;
  loadInFlight = null;
};

/** Deduped NextAuth client session fetch — use instead of calling `getSession()` directly. */
export const loadSession = async (options?: {
  force?: boolean;
}): Promise<Session | null> => {
  if (!options?.force && isFresh()) {
    return cachedSession;
  }

  if (loadInFlight) {
    return loadInFlight;
  }

  loadInFlight = getSession({ broadcast: false })
    .then((session) => {
      cachedSession = session;
      lastFetchedAt = Date.now();
      return session;
    })
    .finally(() => {
      loadInFlight = null;
    });

  return loadInFlight;
};

export const getAccessTokenFromCache = (): string | undefined =>
  cachedSession?.user?.accessToken;
