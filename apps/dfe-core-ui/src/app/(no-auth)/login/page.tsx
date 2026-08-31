import { authOptions } from '@/core/config/auth';
import { isAppShellSession } from '@/core/config/authSession';
import { isProxyAuthMode } from '@/core/config/proxyTrust';
import { LoginScene } from '@/core/scenes/LoginScene';
import { ProxyTrustGate } from '@/core/scenes/LoginScene/ProxyTrustGate';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Consults deployment state (getSetupStatus): never static -- build-time
// prerender has no env and fails the build.
export const dynamic = 'force-dynamic';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // The wizard needs an authenticated session, so the form must stay
  // reachable while setup is incomplete -- only signed-in users are
  // herded into the wizard.
  const session = await getServerSession(authOptions);
  const { initial_setup } = await getSetupStatus();

  if (session && !initial_setup.complete) {
    redirect('/setup');
  }
  if (isAppShellSession(session)) {
    redirect('/');
  }
  const params = await searchParams;
  const callbackUrl =
    (typeof params?.callbackUrl === 'string'
      ? params.callbackUrl
      : params?.callbackUrl?.[0]) ?? '/';

  // Behind the proxy: auto-establish the session from the forwarded engine
  // token instead of showing the password form (falls back to it on failure).
  if (isProxyAuthMode()) {
    return <ProxyTrustGate callbackUrl={callbackUrl} />;
  }

  return <LoginScene callbackUrl={callbackUrl} />;
}
