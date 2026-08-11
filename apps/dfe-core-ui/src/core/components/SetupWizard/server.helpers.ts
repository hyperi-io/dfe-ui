import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { TSetupWizardStep } from './types';

export const SETUP_WIZARD_STEPS: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureOrganisation',
  'configureUser',
  'resetBreakGlassAccount',
  'complete',
];

export const isSetupWizardStep = (value: string): value is TSetupWizardStep =>
  SETUP_WIZARD_STEPS.includes(value as TSetupWizardStep);

export const getSetupWizardStepFromStateStep = (
  stateStep?:
    | NonNullable<
        TFetchSetupStatusResponse['initial_setup']['pending_steps']
      >[number]
    | null,
) => {
  switch (stateStep) {
    case 'organisation':
      return 'configureOrganisation';
    case 'first_user':
      return 'configureLogin';
    case 'admin_password':
      return 'resetBreakGlassAccount';
    default:
      return 'welcome';
  }
};
