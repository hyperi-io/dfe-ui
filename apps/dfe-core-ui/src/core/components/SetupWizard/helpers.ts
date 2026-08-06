import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export type TSetupWizardStep =
  | 'welcome'
  | 'configureLogin'
  | 'configureUser'
  | 'configureOrganisation'
  | 'complete';

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
  const oidc_provider_name = searchParams.get('oidc_provider_name');

  const params = Object.fromEntries(searchParams.entries());

  const setParams = useCallback(
    (newParams: Record<string, string>) => {
      router.replace(
        `${pathname}?${new URLSearchParams({
          ...(step ? { step } : {}),
          ...(oidc_provider_name ? { oidc_provider_name } : {}),
          ...newParams,
        }).toString()}`,
      );
    },
    [router, pathname, step, oidc_provider_name],
  );

  return { params, setParams };
};
