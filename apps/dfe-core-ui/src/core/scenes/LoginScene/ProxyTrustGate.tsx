'use client';

import { PROXY_TRUST_PROVIDER_ID } from '@/core/config/proxyTrust.constants';
import { LoginScene } from '@/core/scenes/LoginScene';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Proxy-trust auto-trigger (DFE_AUTH_MODE=proxy). Rendered by the login page
 * when behind the proxy: on mount it runs the CSRF-safe NextAuth callback for
 * the proxy-trust provider, which reads the forwarded engine token from the
 * request (dfe_token cookie / Bearer) and re-verifies it against the engine
 * JWKS. On success the browser is bounced to callbackUrl with no password form.
 *
 * If the token is missing or invalid (e.g. local dev with no proxy, or an
 * expired token) it falls back to the credentials/password form so no one is
 * locked out.
 */
export const ProxyTrustGate = ({
  callbackUrl = '/',
}: {
  callbackUrl?: string;
}) => {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    signIn(PROXY_TRUST_PROVIDER_ID, { redirect: false, callbackUrl })
      .then((res) => {
        if (!active) return;
        if (res && !res.error) {
          const url = res.url ?? callbackUrl;
          const path = url.startsWith('http') ? new URL(url).pathname : url;
          router.refresh();
          router.push(path);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [callbackUrl, router]);

  if (failed) {
    return <LoginScene callbackUrl={callbackUrl} />;
  }

  return (
    <main className="h-screen w-full flex items-center justify-center">
      <Spin size="large" />
    </main>
  );
};
