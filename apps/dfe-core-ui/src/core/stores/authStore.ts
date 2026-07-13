'use client';

import { loadSession, resetCachedSession } from '@/core/auth/cachedSession';
import { SESSION_AUTH_REFRESH_INTERVAL_MS } from '@/core/config/authSession';
import { fetchAuthMe } from '@/core/hooks/useAuthMe/api';
import type { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import type { Session } from 'next-auth';
import { create } from 'zustand';

type AuthStoreState = {
  me: TAuthMeResponse | null;
  meLoading: boolean;
  meError: Error | null;
  meLastFetchedAt: number | null;
  session: Session | null;
  sessionLastFetchedAt: number | null;
  refreshInFlight: Promise<void> | null;
  fetchMe: (options?: { force?: boolean }) => Promise<void>;
  fetchSession: (options?: { force?: boolean }) => Promise<void>;
  refreshAuth: (options?: { force?: boolean }) => Promise<void>;
  ensureMeLoaded: () => void;
  reset: () => void;
};

const initialState = {
  me: null,
  meLoading: false,
  meError: null,
  meLastFetchedAt: null,
  session: null,
  sessionLastFetchedAt: null,
  refreshInFlight: null,
} satisfies Omit<
  AuthStoreState,
  'fetchMe' | 'fetchSession' | 'refreshAuth' | 'ensureMeLoaded' | 'reset'
>;

const isFresh = (lastFetchedAt: number | null) =>
  lastFetchedAt != null &&
  Date.now() - lastFetchedAt < SESSION_AUTH_REFRESH_INTERVAL_MS;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  ...initialState,

  reset: () => {
    resetCachedSession();
    set({ ...initialState, refreshInFlight: null });
  },

  fetchMe: async ({ force = false } = {}) => {
    const { meLoading, meLastFetchedAt, me } = get();
    if (meLoading || (!force && isFresh(meLastFetchedAt))) {
      return;
    }

    const isInitialLoad = me == null;
    if (isInitialLoad) {
      set({ meLoading: true, meError: null });
    } else {
      set({ meError: null });
    }

    try {
      const nextMe = await fetchAuthMe();
      set({
        me: nextMe,
        meLastFetchedAt: Date.now(),
        meError: null,
      });
    } catch (error) {
      set({
        meError: error instanceof Error ? error : new Error(String(error)),
      });
    } finally {
      if (isInitialLoad) {
        set({ meLoading: false });
      }
    }
  },

  fetchSession: async ({ force = false } = {}) => {
    const { sessionLastFetchedAt } = get();
    if (!force && isFresh(sessionLastFetchedAt)) {
      return;
    }

    const session = await loadSession({ force });
    set({
      session,
      sessionLastFetchedAt: Date.now(),
    });
  },

  refreshAuth: async ({ force = false } = {}) => {
    const existing = get().refreshInFlight;
    if (existing) {
      return existing;
    }

    const refresh = get().fetchMe({ force });

    set({ refreshInFlight: refresh });
    try {
      await refresh;
    } finally {
      if (get().refreshInFlight === refresh) {
        set({ refreshInFlight: null });
      }
    }
  },

  ensureMeLoaded: () => {
    void get().fetchMe();
  },
}));
