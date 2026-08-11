'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { isSetupWizardStep } from './server.helpers';
import { TSetupWizardStep } from './types';

export const SETUP_WIZARD_STEPS: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureOrganisation',
  'configureUser',
  'resetBreakGlassAccount',
  'complete',
];

export const useSetupWizardNavigateToStep = () => {
  const router = useRouter();
  const params = useParams<{ step: string }>();

  const stepParam = params.step;
  const currentStep: TSetupWizardStep = isSetupWizardStep(stepParam)
    ? stepParam
    : 'welcome';

  const navigateToStep = useCallback(
    (nextStep: TSetupWizardStep) => {
      router.replace(`/setup/${nextStep}`);
    },
    [router],
  );

  return {
    currentStep,
    navigateToStep,
  };
};
