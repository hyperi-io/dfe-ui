'use client';

import { setCachedSession } from '@/core/auth/cachedSession';
import { useAuthStore } from '@/core/stores/authStore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/** Keeps zustand + in-memory session cache aligned with NextAuth `SessionProvider`. */
export const SessionAuthBridge = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    setCachedSession(session ?? null);
    useAuthStore.setState({
      session: session ?? null,
      sessionLastFetchedAt: Date.now(),
    });
  }, [session, status]);

  return null;
};
