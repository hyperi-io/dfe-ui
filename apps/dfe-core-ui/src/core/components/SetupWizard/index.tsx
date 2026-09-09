import { TSetupWizardProps } from '@/core/hooks/useFetchSetupStatus/types';
import { CompleteStep } from './CompleteStep';
import { ConfigureOidcStep } from './ConfigureOidcStep';
import { ConfigureOrganisationStep } from './ConfigureOrganisation';
import { ConfigureUserStep } from './ConfigureUserStep';
import { useSetupWizardNavigateToStep } from './helpers';
import { ResetBreakGlassAccount } from './ResetBreakGlassAccount';
import { SETUP_WIZARD_STEPS } from './server.helpers';
import { WelcomeStep } from './WelcomeStep';

export const SetupWizard = ({
  oidcProvider,
  organisation,
  userCreated,
  breakGlass,
}: TSetupWizardProps) => {
  // No auto-login here. The operator signs in on /login with the password their
  // deployment minted, and the route's layout guard is what guarantees this
  // wizard only ever renders for a session that can actually call the engine.
  const { currentStep, navigateToStep } = useSetupWizardNavigateToStep();

  return (
    <>
      {currentStep === 'welcome' && (
        <WelcomeStep
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureLogin' && (
        <ConfigureOidcStep
          oidcProvider={oidcProvider}
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureOrganisation' && (
        <ConfigureOrganisationStep
          organisation={organisation}
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureUser' && (
        <ConfigureUserStep
          oidcProviderName={oidcProvider?.name}
          userCreated={userCreated}
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
      {currentStep === 'resetBreakGlassAccount' && (
        <ResetBreakGlassAccount
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
          breakGlass={breakGlass}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
    </>
  );
};
