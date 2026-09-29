'use client';

import { consumeOidcLoginNonce } from '@/core/auth/oidcLoginNonce';
import { NotificationCard } from '@/core/components/NotificationCard';
import { safeRedirectPath } from '@/core/config/loginCallback';
import {
  OIDC_TOKEN_PROVIDER_ID,
  readTokenFragment,
} from '@/core/config/oidcToken.constants';
import { LoginScene } from '@/core/scenes/LoginScene';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type THandBack = {
  fragment: ReturnType<typeof readTokenFragment>;
  startedHere: boolean;
};

/**
 * Lands the engine's OIDC callback in the console. The engine 303s here with
 * the engine token in the URL fragment; this reads it once, drops it from the
 * address bar, and signs in through the oidc-token provider so the session is
 * the same shape a password login produces. Then the browser goes to callbackUrl.
 *
 * The token is only used when the login nonce matches the one this tab stored
 * when it started the login (core/auth/oidcLoginNonce).
 */
export const OidcCallbackGate = ({
  callbackUrl = '/',
  loginNonce,
}: {
  callbackUrl?: string;
  loginNonce?: string;
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const target = safeRedirectPath(callbackUrl);
  // Read once per mount: the fragment is stripped and the nonce spent on the first read.
  const handBack = useRef<THandBack | null>(null);

  useEffect(() => {
    let active = true;
    if (!handBack.current) {
      handBack.current = {
        fragment: readTokenFragment(window.location.hash),
        startedHere: consumeOidcLoginNonce(loginNonce),
      };
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    }
    const { fragment, startedHere } = handBack.current;

    // Resolved on the next tick so the failure path is a callback, not a synchronous setState.
    const signInWithToken =
      fragment && startedHere
        ? signIn(OIDC_TOKEN_PROVIDER_ID, {
            redirect: false,
            token: fragment.token,
          })
        : Promise.resolve({ error: 'login not accepted' });

    signInWithToken
      .then((res) => {
        if (!active) return;
        if (res && !res.error) {
          router.refresh();
          router.replace(target);
        } else if (!fragment) {
          setError('The identity provider did not hand back a login token.');
        } else if (!startedHere) {
          setError(
            'This sign-in was not started from this browser tab, so it was not accepted. Start it again from the login page.',
          );
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
  }, [router, target, loginNonce]);

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
