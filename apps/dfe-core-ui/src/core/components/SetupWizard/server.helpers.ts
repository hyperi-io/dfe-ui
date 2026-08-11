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
