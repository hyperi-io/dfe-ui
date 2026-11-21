/**
 * OIDC hand-back constants with no server-only deps, safe to import from
 * client components.
 */

import type { paths } from '@repo/dfe-engine-types';

/** NextAuth provider id for the CredentialsProvider that accepts an engine token. */
export const OIDC_TOKEN_PROVIDER_ID = 'oidc-token';

/** Console route the engine's OIDC callback returns the browser to. */
export const OIDC_CONSOLE_CALLBACK_PATH = '/login/oidc';

/** Query parameter on the return URL that carries this browser's login nonce. */
export const OIDC_LOGIN_NONCE_PARAM = 'login_nonce';

/** The engine token the callback put in the URL fragment, read once. */
export function readTokenFragment(hash: string): {
  token: string;
  provider: string;
} | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const token = params.get('access_token');
  if (!token) return null;
  return { token, provider: params.get('provider') ?? '' };
}

/** The code the engine refused the login with, from the same fragment. */
export function readRefusalFragment(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('error') || null;
}

/** NextAuth provider id for the CredentialsProvider that links a held IdP sign-in with its account's password. */
export const OIDC_LINK_PROVIDER_ID = 'oidc-link';

/** The engine route the link provider redeems a ticket at, server-side only. */
export const OIDC_LINK_PATH = '/api/v1/auth/oidc/link' satisfies keyof paths;

/** The sign-in the engine held for its account's password: that account, and the ticket the link redeems. */
export function readLinkFragment(hash: string): {
  account: string;
  ticket: string;
} | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const account = params.get('account');
  const ticket = params.get('link_ticket');
  if (params.get('error') !== 'link_required' || !account || !ticket) {
    return null;
  }
  return { account, ticket };
}
