import { NotificationCard } from '@/core/components/NotificationCard';
import { useOidcLogin } from '@/core/hooks/useOidcLogin';
import { Spin } from 'antd';
import { useEffect } from 'react';

export const OidcLoginPopup = ({
  closePopup,
  oidcProviderName,
}: {
  closePopup: () => void;
  oidcProviderName: string;
}) => {
  const { data, isLoading, error } = useOidcLogin({
    provider: oidcProviderName,
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
