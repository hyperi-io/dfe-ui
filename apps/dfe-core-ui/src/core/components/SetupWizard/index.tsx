import { WelcomeStep } from './1WelcomeStep';
import { ConfigureOidcStep } from './2ConfigureOidcStep';
import { ConfigureUserStep } from './3ConfigureUserStep';
import { ConfigureOrganisationStep } from './4ConfigureOrganisation';
import { CompleteStep } from './CompleteStep';
import { TSetupWizardStep, useNavigateToStep } from './helpers';

const STEP_CONFIG: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureOrganisation',
  'configureUser',
  'complete',
];

export const SetupWizard = () => {
  const { currentStep, navigateToStep } = useNavigateToStep();

  return (
    <>
      {currentStep === 'welcome' && (
        <WelcomeStep
          goNext={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureLogin' && (
        <ConfigureOidcStep
          goNext={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureUser' && (
        <ConfigureUserStep
          goNext={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureOrganisation' && (
        <ConfigureOrganisationStep
          goNext={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
      {currentStep === 'complete' && (
        <CompleteStep
          goPrevious={() =>
            navigateToStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) - 1
              ],
            )
          }
        />
      )}
    </>
  );
};
