'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { isSetupWizardStep } from './server.helpers';
import { TSetupWizardStep } from './types';

export const SETUP_WIZARD_STEPS: TSetupWizardStep[] = [
  'welcome',
  'configureLogin',
  'configureOrganisation',
  'configureUser',
  'complete',
];

export const convertNullUndefinedString = (value: string | null) => {
  return value === 'null' || value === 'undefined' ? undefined : value;
};

const buildSetupPath = (
  step: string,
  oidc_provider_name: string | null | undefined,
  username: string | null | undefined,
  organisation_name: string | null | undefined,
) => {
  const search = new URLSearchParams();
  if (oidc_provider_name) {
    search.set('oidc_provider_name', oidc_provider_name);
  }
  if (username) {
    search.set('username', username);
  }
  if (organisation_name) {
    search.set('organisation_name', organisation_name);
  }
  const qs = search.toString();
  return qs ? `/setup/${step}?${qs}` : `/setup/${step}`;
};

export const useNavigateToStep = () => {
  const params = useParams<{ step: string }>();
  const { navigateToStep } = useSetupWizardParams();

  const stepParam = params.step;
  const currentStep: TSetupWizardStep = isSetupWizardStep(stepParam)
    ? stepParam
    : 'welcome';

  return {
    currentStep,
    navigateToStep,
  };
};

export const useSetupWizardParams = () => {
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const searchParams = useSearchParams();

  const stepParam = params.step;
  const step: TSetupWizardStep | undefined = isSetupWizardStep(stepParam)
    ? stepParam
    : undefined;

  const oidc_provider_name =
    convertNullUndefinedString(searchParams.get('oidc_provider_name')) ?? null;
  const username =
    convertNullUndefinedString(searchParams.get('username')) ?? null;
  const organisation_name =
    convertNullUndefinedString(searchParams.get('organisation_name')) ?? null;

  const setParams = useCallback(
    (newParams: Record<string, string | null | undefined>) => {
      const newStep =
        'step' in newParams && newParams.step
          ? newParams.step
          : (step ?? 'welcome');
      const newOidcProviderName =
        'oidc_provider_name' in newParams
          ? newParams.oidc_provider_name
          : oidc_provider_name;
      const newUsername =
        'username' in newParams ? newParams.username : username;
      const newOrganisationName =
        'organisation_name' in newParams
          ? newParams.organisation_name
          : organisation_name;

      router.replace(
        buildSetupPath(
          newStep,
          newOidcProviderName,
          newUsername,
          newOrganisationName,
        ),
      );
    },
    [router, step, oidc_provider_name, username, organisation_name],
  );

  const navigateToStep = useCallback(
    (nextStep: TSetupWizardStep) => {
      setParams({ step: nextStep });
    },
    [setParams],
  );

  return {
    params: {
      step,
      oidc_provider_name,
      username,
      organisation_name,
    },
    setParams,
    navigateToStep,
  };
};

export const useSetParams = useSetupWizardParams;
