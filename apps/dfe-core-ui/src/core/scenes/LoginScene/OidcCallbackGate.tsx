'use client';

import { NotificationCard } from '@/core/components/NotificationCard';
import {
  OIDC_TOKEN_PROVIDER_ID,
  readTokenFragment,
  safeCallbackPath,
} from '@/core/config/oidcToken.constants';
import { LoginScene } from '@/core/scenes/LoginScene';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Lands the engine's OIDC callback in the console. The engine 303s here with
 * the engine token in the URL fragment; this reads it once, drops it from the
 * address bar, and signs in through the oidc-token provider so the session is
 * the same shape a password login produces. Then the browser goes to callbackUrl.
 */
export const OidcCallbackGate = ({
  callbackUrl = '/',
}: {
  callbackUrl?: string;
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const target = safeCallbackPath(callbackUrl);

  useEffect(() => {
    let active = true;
    const fragment = readTokenFragment(window.location.hash);
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    );
    // Resolved on the next tick so the failure path is a callback, not a synchronous setState.
    const signInWithToken = fragment
      ? signIn(OIDC_TOKEN_PROVIDER_ID, {
          redirect: false,
          token: fragment.token,
        })
      : Promise.resolve({ error: 'no token in the callback fragment' });

    signInWithToken
      .then((res) => {
        if (!active) return;
        if (res && !res.error) {
          router.refresh();
          router.replace(target);
        } else if (!fragment) {
          setError('The identity provider did not hand back a login token.');
        } else {
          setError('The engine did not accept the login token.');
        }
      })
      .catch(() => {
        if (active) setError('The engine did not accept the login token.');
      });
    return () => {
      active = false;
    };
  }, [router, target]);

  if (error) {
    return (
      <>
        <NotificationCard
          title="OIDC login failed"
          description={error}
          type="error"
          className="w-full"
        />
        <LoginScene callbackUrl={target} />
      </>
    );
  }

  return (
    <main className="h-screen w-full flex items-center justify-center">
      <Spin size="large" />
      <span className="sr-only">Completing OIDC login</span>
    </main>
  );
};
