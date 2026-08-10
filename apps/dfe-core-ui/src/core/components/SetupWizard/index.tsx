import { CompleteStep } from './CompleteStep';
import { ConfigureOidcStep } from './ConfigureOidcStep';
import { ConfigureOrganisationStep } from './ConfigureOrganisation';
import { ConfigureUserStep } from './ConfigureUserStep';
import { SETUP_WIZARD_STEPS, useNavigateToStep } from './helpers';
import { WelcomeStep } from './WelcomeStep';

export const SetupWizard = () => {
  const { currentStep, navigateToStep } = useNavigateToStep();

  return (
    <>
      {currentStep === 'welcome' && (
        <WelcomeStep
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) +
                  1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureLogin' && (
        <ConfigureOidcStep
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) +
                  1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureUser' && (
        <ConfigureUserStep
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) +
                  1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) -
                  1
              ],
            )
          }
        />
      )}
      {currentStep === 'configureOrganisation' && (
        <ConfigureOrganisationStep
          goNext={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) +
                  1
              ],
            )
          }
          goPrevious={() =>
            navigateToStep(
              SETUP_WIZARD_STEPS[
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) -
                  1
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
                SETUP_WIZARD_STEPS.findIndex((step) => step === currentStep) -
                  1
              ],
            )
          }
        />
      )}
    </>
  );
};
