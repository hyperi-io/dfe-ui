import { NotificationCard } from '@/core/components/NotificationCard';
import { useSetupWizardParams } from '@/core/components/SetupWizard/helpers';
import { useOidcLogin } from '@/core/hooks/useOidcLogin';
import { Spin } from 'antd';
import { useEffect } from 'react';

export const OidcLoginPopup = ({ closePopup }: { closePopup: () => void }) => {
  const {
    params: { oidc_provider_name },
  } = useSetupWizardParams();

  const { data, isLoading, error } = useOidcLogin({
    provider: oidc_provider_name ?? '',
  });

  useEffect(() => {
    if (isLoading) return;

    if (data?.authorization_url) {
      window.location.assign(data.authorization_url);
    }

    return () => {
      queueMicrotask(() => closePopup());
    };
  }, [data?.authorization_url, closePopup, isLoading]);

  if (isLoading) {
    return (
      <>
        <Spin />
        <span className="sr-only">Loading OIDC login</span>
      </>
    );
  }

  if (error) {
    return (
      <NotificationCard
        title="Unexpected Error Occurred"
        description={error.message}
        type="error"
        className="w-full"
      />
    );
  }

  return <></>;
};
