import { isSetupWizardStep } from '@/core/components/SetupWizard/server.helpers';
import { SetupScene } from '@/core/scenes/SetupScene';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { notFound, redirect } from 'next/navigation';

export default async function SetupStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!step) {
    redirect('/setup/welcome');
  }

  if (!isSetupWizardStep(step)) {
    notFound();
  }

  const { initial_setup, oidc_providers, organisations } =
    await getSetupStatus();
  if (initial_setup.complete) {
    redirect('/login');
  }

  return (
    <SetupScene
      oidcProvider={oidc_providers?.[0] || null}
      organisation={organisations?.[0] || null}
    />
  );
}
