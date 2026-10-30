import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { TSetupWizardStep } from './types';

export const SETUP_WIZARD_STEPS: TSetupWizardStep[] = [
  'welcome',
  'configureOrganisation',
  'configureSource',
  'configureLogin',
  'configureUser',
  'complete',
];

// The engine's setup machine does not report these screens, so Welcome's jump
// to the first pending engine step must not leap over them.
const ENGINE_UNAWARE_STEPS = new Set<TSetupWizardStep>(['configureSource']);

export const isSetupWizardStep = (value: string): value is TSetupWizardStep =>
  SETUP_WIZARD_STEPS.includes(value as TSetupWizardStep);

type TPendingSteps =
  TFetchSetupStatusResponse['initial_setup']['pending_steps'];

/* import-scope-drift-disable - (exported for tests) */
// The cases are the engine's own step ids (state_machines/setup.py::STEP_*), so
// a rename there has to be mirrored here.
export const getSetupWizardStepFromStateStep = (
  stateStep?: NonNullable<TPendingSteps>[number] | null,
): TSetupWizardStep => {
  switch (stateStep) {
    case 'organisations':
      return 'configureOrganisation';
    case 'first_user':
      return 'configureLogin';
    default:
      return 'welcome';
  }
};
/* import-scope-drift-enable */

// Welcome's Next target. A step id this build does not know maps to welcome, so
// it falls back to the screen after welcome rather than looping on it. A screen
// the engine does not report still has to come up before a later engine step.
export const getFirstPendingWizardStep = (
  pendingSteps?: TPendingSteps | null,
): TSetupWizardStep => {
  const step = getSetupWizardStepFromStateStep(pendingSteps?.[0]);
  const mapped = step === 'welcome' ? 'configureOrganisation' : step;
  const mappedIndex = SETUP_WIZARD_STEPS.indexOf(mapped);
  const blocking = SETUP_WIZARD_STEPS.find(
    (candidate, index) =>
      index < mappedIndex && ENGINE_UNAWARE_STEPS.has(candidate),
  );
  return blocking ?? mapped;
};
