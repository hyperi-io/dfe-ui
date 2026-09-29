import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { redirect } from 'next/navigation';

// Consults deployment state (getSetupStatus): never static -- build-time
// prerender has no env and fails the build.
export const dynamic = 'force-dynamic';

// Welcome is the wizard's front door: its Next walks to the first pending step.
export default async function Setup() {
  const { initial_setup } = await getSetupStatus();
  if (initial_setup.complete) {
    redirect('/');
  }

  redirect('/setup/welcome');
}
