import {
  getFirstPendingWizardStep,
  isSetupWizardStep,
} from '@/core/components/SetupWizard/server.helpers';
import { SetupScene } from '@/core/scenes/SetupScene';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { notFound, redirect } from 'next/navigation';

// Consults deployment state (getSetupStatus): never static -- build-time
// prerender has no env and fails the build.
export const dynamic = 'force-dynamic';

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
  // The last step completes setup, so Complete has to outlive it. The others
  // close: a completed status redacts the registries they would render.
  if (initial_setup.complete && step !== 'complete') {
    redirect('/');
  }

  const userCreated =
    initial_setup?.completed_steps?.includes('first_user') ?? false;

  return (
    <SetupScene
      oidcProvider={oidc_providers?.[0] || null}
      organisation={organisations?.[0] || null}
      userCreated={userCreated}
      firstPendingStep={getFirstPendingWizardStep(initial_setup.pending_steps)}
      setupComplete={initial_setup.complete}
    />
  );
}
