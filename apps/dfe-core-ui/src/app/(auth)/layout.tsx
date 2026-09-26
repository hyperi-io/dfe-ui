import { AppLayout } from '@/core/components/AppLayout';
import { authOptions } from '@/core/config/auth';
import {
  CHANGE_PASSWORD_PATH,
  isPasswordChangeRequired,
} from '@/core/config/authSession';
import {
  LOGIN_CALLBACK_PATH_HEADER,
  loginRedirectPath,
} from '@/core/config/loginCallback';
import { HyperdxPortProvider } from '@/core/contexts/HyperdxContext';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Authenticated pages are never static: prerendering them at build time runs
// getSetupStatus with no deployment env and fails the build.
export const dynamic = 'force-dynamic';

async function redirectToLogin(): Promise<never> {
  const headerStore = await headers();
  const callbackPath =
    headerStore.get(LOGIN_CALLBACK_PATH_HEADER)?.trim() || '/';
  redirect(loginRedirectPath(callbackPath));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication first, setup second. The wizard runs entirely on
  // authenticated engine calls, so an anonymous visitor sent to /setup gets a
  // form that 401s the moment they submit it.
  const session = await getServerSession(authOptions);
  if (!session) {
    await redirectToLogin();
  }

  const accessToken = session?.user?.accessToken;
  if (!accessToken) {
    await redirectToLogin();
  }

  // A returning user can hold a live session cookie but an engine token that
  // expired while the tab was closed, and that token cannot be refreshed (the
  // engine's /auth/refresh needs a still-valid one). The jwt callback flags that
  // as AccessTokenExpired; redirect to /login rather than let the client fire a
  // 401 storm then sign out. An active user never reaches this because the
  // client refreshes before expiry.
  if (session?.error === 'AccessTokenExpired') {
    await redirectToLogin();
  }

  // The engine refuses an account on an issued password everything but the
  // change, so no page renders until it is made.
  if (isPasswordChangeRequired(session)) {
    redirect(CHANGE_PASSWORD_PATH);
  }

  const { initial_setup } = await getSetupStatus();
  if (!initial_setup.complete) {
    redirect('/setup');
  }

  // Read at request time (this layout is dynamic via getServerSession) so both
  // are runtime/deployment values, never baked into the client bundle.
  // HYPERDX_URL wins (own-hostname deployments, e.g. the k8s gateway);
  // HYPERDX_PORT derives same-host-different-port client-side from
  // window.location (docker), so it is correct for any access host.
  const hyperdxUrl = process.env.HYPERDX_URL || undefined;
  const hyperdxPort = process.env.HYPERDX_PORT || undefined;

  return (
    <HyperdxPortProvider url={hyperdxUrl} port={hyperdxPort}>
      <AppLayout>{children}</AppLayout>
    </HyperdxPortProvider>
  );
}
