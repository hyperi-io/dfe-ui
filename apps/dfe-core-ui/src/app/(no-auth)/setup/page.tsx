import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { redirect } from 'next/navigation';

export default async function Setup() {
  const { initial_setup } = await getSetupStatus();
  if (initial_setup.complete) {
    redirect('/login');
  }

  redirect('/setup/welcome');
}
