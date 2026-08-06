import { useEffect } from 'react';
import { WelcomeStep } from './1WelcomeStep';
import { ConfigureOidcStep } from './2ConfigureOidcStep';
import { ConfigureUserStep } from './3ConfigureUserStep';
import { ConfigureOrganisationStep } from './4ConfigureOrganisation';
import { CompleteStep } from './CompleteStep';
import { TSetupWizardStep, useNavigateToStep, useSetParams } from './helpers';

const STEP_CONFIG: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureUser',
  'configureOrganisation',
  'complete',
];

export const SetupWizard = () => {
  const { params } = useSetParams();
  const { currentStep, navigateToStep } = useNavigateToStep();

  useEffect(() => {
    if (params.step) {
      navigateToStep(params.step as TSetupWizardStep);
    }
  }, [params.step, navigateToStep]);
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
