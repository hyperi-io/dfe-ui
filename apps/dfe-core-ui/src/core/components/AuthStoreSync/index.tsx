'use client';

import { SESSION_AUTH_REFRESH_INTERVAL_MS } from '@/core/config/authSession';
import { useAuthStore } from '@/core/stores/authStore';
import { useEffect } from 'react';

/** Polls `/auth/me` on an env-backed interval. Session stays on SessionAuthBridge + NextAuth provider. */
export const AuthStoreSync = () => {
  const refreshAuth = useAuthStore((state) => state.refreshAuth);

  useEffect(() => {
    void refreshAuth({ force: true });

    const intervalId = window.setInterval(() => {
      void refreshAuth({ force: true });
    }, SESSION_AUTH_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshAuth]);

  return null;
};
