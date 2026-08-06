import { authOptions } from '@/core/config/auth';
import { SetupScene } from '@/core/scenes/SetupScene';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Setup() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/');
  }

  const { initial_setup_required } = await getSetupStatus();
  if (!initial_setup_required) {
    redirect('/login');
  }

  return <SetupScene />;
}
