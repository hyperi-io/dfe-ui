'use client';

import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

/** Signs the user out when the API access token is missing or expired in session. */
export const AuthSessionMonitor = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const signingOut = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || pathname.startsWith('/login')) {
      return;
    }

    const accessToken = session?.user?.accessToken;
    const sessionError = session?.error;

    if (accessToken && sessionError !== 'AccessTokenExpired') {
      return;
    }

    if (signingOut.current) {
      return;
    }

    signingOut.current = true;
    void signOut({
      callbackUrl: `/login?callbackUrl=${encodeURIComponent(pathname)}`,
    }).finally(() => {
      signingOut.current = false;
    });
  }, [session, status, pathname]);

  return null;
};
