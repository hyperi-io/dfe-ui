import { getSetupWizardStepFromStateStep } from '@/core/components/SetupWizard/server.helpers';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { redirect } from 'next/navigation';

export default async function Setup() {
  const { initial_setup } = await getSetupStatus();
  if (initial_setup.complete) {
    redirect('/login');
  }

  const currenStep = getSetupWizardStepFromStateStep(
    initial_setup?.pending_steps?.[0],
  );

  redirect(`/setup/${currenStep}`);
}
