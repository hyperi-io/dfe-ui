'use client';

import {
  buildOidcLoginUrl,
  getConfiguredOidcProviders,
} from '@/core/config/oidc';
import { Button, Divider } from 'antd';

// SSO buttons for the login screen. One per provider configured in
// NEXT_PUBLIC_OIDC_PROVIDERS; renders nothing when none are configured, so the
// plain credentials login is untouched on deployments without external OIDC.
//
// Clicking a button navigates the whole browser to the engine's OIDC login
// endpoint (a full-page redirect, not a fetch) so the server-side auth-code
// flow and its cookies work normally.
export const SsoButtons = () => {
  const providers = getConfiguredOidcProviders();
  if (providers.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2" data-testid="sso-buttons">
      <Divider plain className="!my-1 text-xs text-muted-foreground">
        or continue with
      </Divider>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          block
          onClick={() => window.location.assign(buildOidcLoginUrl(provider.id))}
        >
          {`Sign in with ${provider.label}`}
        </Button>
      ))}
    </div>
  );
};
