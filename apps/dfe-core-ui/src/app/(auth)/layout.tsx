import { AppLayout } from '@/core/components/AppLayout';
import { authOptions } from '@/core/config/auth';
import { HyperdxPortProvider } from '@/core/contexts/HyperdxContext';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initial_setup_required } = await getSetupStatus();
  if (initial_setup_required) {
    // redirect('/setup');
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const accessToken = session.user?.accessToken;
  if (!accessToken) {
    redirect('/login');
  }

  // Read at request time (this layout is dynamic via getServerSession) so the
  // HyperDX port is a runtime/deployment value, not baked into the client
  // bundle. The browser-facing URL is derived from window.location + this port
  // client-side (see useHyperdxUrl), so it is correct for any access host.
  const hyperdxPort = process.env.HYPERDX_PORT || undefined;

  return (
    <HyperdxPortProvider port={hyperdxPort}>
      <AppLayout>{children}</AppLayout>
    </HyperdxPortProvider>
  );
}
