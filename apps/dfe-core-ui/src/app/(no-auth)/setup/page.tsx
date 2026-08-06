import { SetupScene } from '@/core/scenes/SetupScene';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { redirect } from 'next/navigation';

export default async function Setup() {
  const { initial_setup_required } = await getSetupStatus();
  if (!initial_setup_required) {
    redirect('/login');
  }

  return <SetupScene />;
}
