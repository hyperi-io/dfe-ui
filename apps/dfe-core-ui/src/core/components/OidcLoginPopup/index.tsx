import {
  createOidcLoginNonce,
  rememberOidcLoginNonce,
} from '@/core/auth/oidcLoginNonce';
import { NotificationCard } from '@/core/components/NotificationCard';
import { safeRedirectPath } from '@/core/config/loginCallback';
import {
  OIDC_CONSOLE_CALLBACK_PATH,
  OIDC_LOGIN_NONCE_PARAM,
} from '@/core/config/oidcToken.constants';
import { useOidcLogin } from '@/core/hooks/useOidcLogin';
import { navigateWithReload } from '@/core/utils/navigation';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';

/** The console page the engine callback returns to; absolute, so it works split-origin too. */
export const oidcReturnUrl = (
  origin: string,
  callbackUrl: string,
  nonce: string,
): string => {
  const query = new URLSearchParams({
    callbackUrl: safeRedirectPath(callbackUrl, origin),
    [OIDC_LOGIN_NONCE_PARAM]: nonce,
  });
  return `${origin}${OIDC_CONSOLE_CALLBACK_PATH}?${query}`;
};

export const OidcLoginPopup = ({
  closePopup,
  oidcProviderName,
  callbackUrl = '/',
}: {
  closePopup: () => void;
  oidcProviderName: string;
  callbackUrl?: string;
}) => {
  // One nonce per login attempt: the engine is handed this return URL once.
  const [nonce] = useState(createOidcLoginNonce);
  const { data, isLoading, error } = useOidcLogin({
    provider: oidcProviderName,
    returnTo: oidcReturnUrl(window.location.origin, callbackUrl, nonce),
  });

  useEffect(() => {
    if (isLoading) return;

    if (data?.authorization_url) {
      rememberOidcLoginNonce(nonce);
      navigateWithReload(data.authorization_url);
    }

    return () => {
      queueMicrotask(() => closePopup());
    };
  }, [data?.authorization_url, closePopup, isLoading, nonce]);

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
