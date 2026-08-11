import { TSetupWizardProps } from '@/core/hooks/useFetchSetupStatus/types';
import { CompleteStep } from './CompleteStep';
import { ConfigureOidcStep } from './ConfigureOidcStep';
import { ConfigureOrganisationStep } from './ConfigureOrganisation';
import { ConfigureUserStep } from './ConfigureUserStep';
import { SETUP_WIZARD_STEPS, useSetupWizardNavigateToStep } from './helpers';
import { ResetBreakGlassAccount } from './ResetBreakGlassAccount';
import { WelcomeStep } from './WelcomeStep';

export const SetupWizard = ({
  oidcProvider,
  organisation,
  userCreated,
  isAdminReset,
}: TSetupWizardProps) => {
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
          isAdminReset={isAdminReset}
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
