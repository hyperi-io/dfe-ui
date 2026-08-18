'use client';

import {
  SESSION_CHECK_INTERVAL_MS,
  shouldRefreshAccessToken,
} from '@/core/config/authSession';
import { isNoAuthRoute } from '@/core/config/isNoAuthRoute';
import { useRefreshToken } from '@/core/hooks/useRefreshToken';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/** Keeps the API access token fresh and signs out only when refresh fails. */
export const AuthSessionMonitor = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { mutateAsync: refreshToken, isPending: isRefreshing } =
    useRefreshToken();

  const refreshInFlight = useRef(false);
  const signingOut = useRef(false);
  const lastRefreshAttemptAt = useRef<number | undefined>(undefined);
  const knownExpiresAt = useRef<number | undefined>(undefined);

  const accessToken = session?.user?.accessToken;
  const accessTokenExpiresAt = session?.accessTokenExpiresAt;
  const sessionError = session?.error;
  const [scheduledCheck, setScheduledCheck] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated' || isNoAuthRoute(pathname)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setScheduledCheck((value) => value + 1);
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status, pathname]);

  useEffect(() => {
    if (status !== 'authenticated' || isNoAuthRoute(pathname)) {
      return;
    }

    if (!accessToken) {
      if (signingOut.current) {
        return;
      }
      signingOut.current = true;
      void signOut({
        callbackUrl: `/login?callbackUrl=${encodeURIComponent(pathname)}`,
      }).finally(() => {
        signingOut.current = false;
      });
      return;
    }

    if (
      !shouldRefreshAccessToken({
        accessTokenExpiresAt,
        sessionError,
        lastRefreshAttemptAt: lastRefreshAttemptAt.current,
        knownExpiresAt: knownExpiresAt.current,
      })
    ) {
      return;
    }

    if (refreshInFlight.current || isRefreshing) {
      return;
    }

    refreshInFlight.current = true;
    lastRefreshAttemptAt.current = Date.now();

    void refreshToken()
      .then((tokenResponse) => {
        knownExpiresAt.current = Date.now() + tokenResponse.expires_in * 1000;
      })
      .catch(() => {
        if (signingOut.current) {
          return;
        }
        signingOut.current = true;
        void signOut({
          callbackUrl: `/login?callbackUrl=${encodeURIComponent(pathname)}`,
        }).finally(() => {
          signingOut.current = false;
        });
      })
      .finally(() => {
        refreshInFlight.current = false;
      });
  }, [
    accessToken,
    accessTokenExpiresAt,
    sessionError,
    status,
    pathname,
    isRefreshing,
    scheduledCheck,
    refreshToken,
  ]);

  return null;
};
