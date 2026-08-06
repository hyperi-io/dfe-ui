import { useState } from 'react';
import { WelcomeStep } from './1WelcomeStep';
import { ConfigureOidcStep } from './2ConfigureOidcStep';
import { ConfigureUserStep } from './3ConfigureUserStep';
import { ConfigureOrganisationStep } from './4ConfigureOrganisation';
import { CompleteStep } from './CompleteStep';

export type TSetupWizardStep =
  | 'welcome'
  | 'configureLogin'
  | 'configureUser'
  | 'configureOrganisation'
  | 'complete';

const STEP_CONFIG: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureUser',
  'configureOrganisation',
  'complete',
];

export const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState<TSetupWizardStep>('welcome');
  return (
    <>
      {currentStep === 'welcome' && (
        <WelcomeStep
          goNext={() =>
            setCurrentStep(
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
            setCurrentStep(
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
            setCurrentStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            setCurrentStep(
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
            setCurrentStep(
              STEP_CONFIG[
                STEP_CONFIG.findIndex((step) => step === currentStep) + 1
              ],
            )
          }
          goPrevious={() =>
            setCurrentStep(
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
            setCurrentStep(
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
