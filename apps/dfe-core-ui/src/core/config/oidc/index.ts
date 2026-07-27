import type { paths } from '@repo/dfe-engine-types';
import { API_CONFIG } from '@/core/config/api/endpoints';

// SSO / external-OIDC login configuration.
//
// The engine is the OIDC Relying Party and the single token issuer: the SSO
// button just sends the browser to the engine's login endpoint, which 302s to
// the external IdP (Google / Okta / Entra / dex), terminates the auth-code
// flow, and re-mints an engine token. The UI never talks to the IdP directly.
//
// Which providers appear on the login screen is deployment config, not baked
// in: NEXT_PUBLIC_OIDC_PROVIDERS is a comma-separated list of provider names
// (matching the engine's provider registry, e.g. "google-workspace,okta").
// Unset -> no SSO buttons, and the credentials form is unaffected.

export interface OidcProviderOption {
  id: string;
  label: string;
}

// Friendly labels for the providers the platform supports. An unknown id still
// renders (title-cased) so a newly-registered provider is not silently dropped.
const PROVIDER_LABELS: Record<string, string> = {
  'google-workspace': 'Google Workspace',
  google: 'Google',
  okta: 'Okta',
  entra: 'Microsoft Entra ID',
  entra_id: 'Microsoft Entra ID',
  dex: 'Dex',
};

const titleCase = (value: string): string =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** The SSO providers configured for this deployment, in listed order. */
export const getConfiguredOidcProviders = (): OidcProviderOption[] =>
  (process.env.NEXT_PUBLIC_OIDC_PROVIDERS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ id, label: PROVIDER_LABELS[id] ?? titleCase(id) }));

// Base URL resolution mirrors src/core/config/api/index.tsx so SSO hits the
// same engine as every other API call.
const apiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : process.env.INTERNAL_API_URL) ||
  '';

const OIDC_LOGIN_PATH: keyof paths = API_CONFIG.oidc.login;

/** The engine URL that begins the OIDC auth-code flow for a provider. */
export const buildOidcLoginUrl = (provider: string): string => {
  const path = OIDC_LOGIN_PATH.replace(
    '{provider}',
    encodeURIComponent(provider),
  );
  return `${apiBaseUrl()}${path}`;
};
