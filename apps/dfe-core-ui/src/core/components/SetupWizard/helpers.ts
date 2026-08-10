import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export type TSetupWizardStep =
  | 'welcome'
  | 'configureLogin'
  | 'configureUser'
  | 'configureOrganisation'
  | 'complete';

export const convertNullUndefinedString = (value: string | null) => {
  return value === 'null' || value === 'undefined' ? undefined : value;
};

export const useNavigateToStep = () => {
  const { setParams } = useSetParams();
  const [currentStep, setCurrentStep] = useState<TSetupWizardStep>('welcome');

  const navigateToStep = useCallback(
    (step: TSetupWizardStep) => {
      setCurrentStep(step);
      setParams({ step });
    },
    [setParams],
  );

  return {
    currentStep,
    navigateToStep,
  };
};

export const useSetParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const step = searchParams.get('step');
  const oidc_provider_name =
    convertNullUndefinedString(searchParams.get('oidc_provider_name')) ?? null;
  const username =
    convertNullUndefinedString(searchParams.get('username')) ?? null;

  const params = Object.fromEntries(searchParams.entries());

  const setParams = useCallback(
    (newParams: Record<string, string | null | undefined>) => {
      const newStep = 'step' in newParams ? newParams.step : step;
      const newOidcProviderName =
        'oidc_provider_name' in newParams
          ? newParams.oidc_provider_name
          : oidc_provider_name;
      const newUsername =
        'username' in newParams ? newParams.username : username;

      router.replace(
        `${pathname}?${new URLSearchParams({
          ...(newStep ? { step: newStep } : {}),
          ...(newOidcProviderName
            ? { oidc_provider_name: newOidcProviderName }
            : {}),
          ...(newUsername ? { username: newUsername } : {}),
        }).toString()}`,
      );
    },
    [router, pathname, step, oidc_provider_name, username],
  );

  return { params, setParams };
};
