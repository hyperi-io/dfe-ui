import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { TSetupWizardStep } from './types';

export const SETUP_WIZARD_STEPS: TSetupWizardStep[] = [
  'welcome',
  'configureOrganisation',
  'configureLogin',
  'configureUser',
  'complete',
];

export const isSetupWizardStep = (value: string): value is TSetupWizardStep =>
  SETUP_WIZARD_STEPS.includes(value as TSetupWizardStep);

// The cases are the engine's own step ids (state_machines/setup.py::STEP_*), so
// a rename there has to be mirrored here.
export const getSetupWizardStepFromStateStep = (
  stateStep?:
    | NonNullable<
        TFetchSetupStatusResponse['initial_setup']['pending_steps']
      >[number]
    | null,
) => {
  switch (stateStep) {
    case 'organisations':
      return 'configureOrganisation';
    case 'first_user':
      return 'configureLogin';
    default:
      return 'welcome';
  }
};
