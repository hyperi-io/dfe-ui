import { NotificationCard } from '@/core/components/NotificationCard';
import {
  OIDC_CONSOLE_CALLBACK_PATH,
  safeCallbackPath,
} from '@/core/config/oidcToken.constants';
import { useOidcLogin } from '@/core/hooks/useOidcLogin';
import { Spin } from 'antd';
import { useEffect } from 'react';

/** The console page the engine callback returns to; absolute, so it works split-origin too. */
const returnToFor = (callbackUrl: string): string =>
  `${window.location.origin}${OIDC_CONSOLE_CALLBACK_PATH}?callbackUrl=${encodeURIComponent(
    safeCallbackPath(callbackUrl),
  )}`;

export const OidcLoginPopup = ({
  closePopup,
  oidcProviderName,
  callbackUrl = '/',
}: {
  closePopup: () => void;
  oidcProviderName: string;
  callbackUrl?: string;
}) => {
  const { data, isLoading, error } = useOidcLogin({
    provider: oidcProviderName,
    returnTo: returnToFor(callbackUrl),
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
