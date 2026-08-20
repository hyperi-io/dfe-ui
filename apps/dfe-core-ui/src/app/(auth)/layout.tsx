import { AppLayout } from '@/core/components/AppLayout';
import { authOptions } from '@/core/config/auth';
import { HyperdxPortProvider } from '@/core/contexts/HyperdxContext';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Authenticated pages are never static: prerendering them at build time runs
// getSetupStatus with no deployment env and fails the build.
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initial_setup } = await getSetupStatus();
  if (!initial_setup.complete) {
    redirect('/setup');
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const accessToken = session.user?.accessToken;
  if (!accessToken) {
    redirect('/login');
  }

  // A returning user can hold a live session cookie but an engine token that
  // expired while the tab was closed, and that token cannot be refreshed (the
  // engine's /auth/refresh needs a still-valid one). The jwt callback flags that
  // as AccessTokenExpired; redirect to /login rather than let the client fire a
  // 401 storm then sign out. An active user never reaches this because the
  // client refreshes before expiry.
  if (initial_setup.complete && session.error === 'AccessTokenExpired') {
    redirect('/login');
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
