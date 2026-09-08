/**
 * OIDC hand-back constants with no server-only deps, safe to import from
 * client components.
 */

/** NextAuth provider id for the CredentialsProvider that accepts an engine token. */
export const OIDC_TOKEN_PROVIDER_ID = 'oidc-token';

/** Console route the engine's OIDC callback returns the browser to. */
export const OIDC_CONSOLE_CALLBACK_PATH = '/login/oidc';

/** A callbackUrl is only ever a path on this console, never another origin. */
export function safeCallbackPath(candidate: string | undefined): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/';
  }
  return candidate;
}

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
