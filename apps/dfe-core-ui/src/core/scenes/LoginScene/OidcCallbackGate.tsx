'use client';

import { consumeOidcLoginNonce } from '@/core/auth/oidcLoginNonce';
import { safeRedirectPath } from '@/core/config/loginCallback';
import { loginRefusal, type TLoginRefusal } from '@/core/config/loginRefusal';
import {
  OIDC_TOKEN_PROVIDER_ID,
  readRefusalFragment,
  readTokenFragment,
} from '@/core/config/oidcToken.constants';
import { LoginScene } from '@/core/scenes/LoginScene';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type THandBack = {
  fragment: ReturnType<typeof readTokenFragment>;
  refusal: string | null;
  startedHere: boolean;
};

// One object per failure, so setting the same failure again does not re-render the gate.
const failed = (description: string): TLoginRefusal => ({
  title: 'OIDC login failed',
  description,
});
const NO_TOKEN = failed(
  'The identity provider did not hand back a login token.',
);
const NOT_THIS_TAB = failed(
  'This sign-in was not started from this browser tab, so it was not accepted. Sign in again below.',
);
const TOKEN_REFUSED = failed('The engine did not accept the login token.');

/**
 * Lands the engine's OIDC callback in the console. The engine 303s here with
 * the engine token in the URL fragment; this reads it once, drops it from the
 * address bar, and signs in through the oidc-token provider so the session is
 * the same shape a password login produces. Then the browser goes to callbackUrl.
 *
 * The token is only used when the login nonce matches the one this tab stored
 * when it started the login (core/auth/oidcLoginNonce). A login the engine
 * refused comes back with its code instead, and the sign-in form says why.
 */
export const OidcCallbackGate = ({
  callbackUrl = '/',
  loginNonce,
}: {
  callbackUrl?: string;
  loginNonce?: string;
}) => {
  const router = useRouter();
  const [failure, setFailure] = useState<TLoginRefusal | null>(null);
  const target = safeRedirectPath(callbackUrl);
  // Read once per mount: the fragment is stripped and the nonce spent on the first read.
  const handBack = useRef<THandBack | null>(null);

  useEffect(() => {
    let active = true;
    if (!handBack.current) {
      handBack.current = {
        fragment: readTokenFragment(window.location.hash),
        refusal: readRefusalFragment(window.location.hash),
        startedHere: consumeOidcLoginNonce(loginNonce),
      };
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    }
    const { fragment, refusal, startedHere } = handBack.current;

    // Resolved on the next tick so the failure path is a callback, not a synchronous setState.
    const signInWithToken =
      fragment && startedHere && !refusal
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
        } else if (refusal) {
          setFailure(loginRefusal(refusal));
        } else if (!fragment) {
          setFailure(NO_TOKEN);
        } else if (!startedHere) {
          setFailure(NOT_THIS_TAB);
        } else {
          setFailure(TOKEN_REFUSED);
        }
      })
      .catch(() => {
        if (active) setFailure(TOKEN_REFUSED);
      });
    return () => {
      active = false;
    };
  }, [router, target, loginNonce]);

  if (failure) {
    return <LoginScene callbackUrl={target} failure={failure} />;
  }

  return (
    <main className="h-screen w-full flex items-center justify-center">
      <Spin size="large" />
      <span className="sr-only">Completing OIDC login</span>
    </main>
  );
};
