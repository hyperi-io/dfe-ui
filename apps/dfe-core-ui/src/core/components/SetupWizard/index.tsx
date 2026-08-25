import { TSetupWizardProps } from '@/core/hooks/useFetchSetupStatus/types';
import { useLogin } from '@/core/hooks/useLogin';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { CompleteStep } from './CompleteStep';
import { ConfigureOidcStep } from './ConfigureOidcStep';
import { ConfigureOrganisationStep } from './ConfigureOrganisation';
import { ConfigureUserStep } from './ConfigureUserStep';
import {
  BREAK_GLASS_ADMIN_PASSWORD,
  BREAK_GLASS_ADMIN_USERNAME,
} from './constants';
import { useSetupWizardNavigateToStep } from './helpers';
import { ResetBreakGlassAccount } from './ResetBreakGlassAccount';
import { SETUP_WIZARD_STEPS } from './server.helpers';
import { WelcomeStep } from './WelcomeStep';

export const SetupWizard = ({
  oidcProvider,
  organisation,
  userCreated,
  isAdminReset,
  breakGlass,
}: TSetupWizardProps) => {
  const { currentStep, navigateToStep } = useSetupWizardNavigateToStep();

  const { status } = useSession();
  const { mutate: loginInitialAdmin } = useLogin({ redirectOnSuccess: false });
  useEffect(() => {
    if (status === 'unauthenticated') {
      loginInitialAdmin({
        username: BREAK_GLASS_ADMIN_USERNAME,
        password: BREAK_GLASS_ADMIN_PASSWORD,
      });
    }
  }, [status, loginInitialAdmin]);

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
