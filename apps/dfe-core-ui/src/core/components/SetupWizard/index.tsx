import { CompleteStep } from './CompleteStep';
import { ConfigureOidcStep } from './ConfigureOidcStep';
import { ConfigureOrganisationStep } from './ConfigureOrganisation';
import { ConfigureUserStep } from './ConfigureUserStep';
import { TSetupWizardStep, useNavigateToStep } from './helpers';
import { WelcomeStep } from './WelcomeStep';

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
