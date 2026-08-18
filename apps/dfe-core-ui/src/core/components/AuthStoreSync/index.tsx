'use client';

import { SESSION_AUTH_REFRESH_INTERVAL_MS } from '@/core/config/authSession';
import { isNoAuthRoute } from '@/core/config/isNoAuthRoute';
import { useAuthStore } from '@/core/stores/authStore';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Polls `/auth/me` on an env-backed interval. Session stays on SessionAuthBridge + NextAuth provider. */
export const AuthStoreSync = () => {
  const pathname = usePathname();
  const refreshAuth = useAuthStore((state) => state.refreshAuth);

  useEffect(() => {
    if (isNoAuthRoute(pathname)) {
      return;
    }

    void refreshAuth({ force: true });

    const intervalId = window.setInterval(() => {
      void refreshAuth({ force: true });
    }, SESSION_AUTH_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pathname, refreshAuth]);

  return null;
};
