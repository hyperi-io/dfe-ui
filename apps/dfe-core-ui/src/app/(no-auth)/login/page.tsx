import { authOptions } from '@/core/config/auth';
import { isProxyAuthMode } from '@/core/config/proxyTrust';
import { LoginScene } from '@/core/scenes/LoginScene';
import { ProxyTrustGate } from '@/core/scenes/LoginScene/ProxyTrustGate';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { initial_setup_required } = await getSetupStatus();
  if (initial_setup_required) {
    redirect('/setup');
  }

  const session = await getServerSession(authOptions);

  if (session) {
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
