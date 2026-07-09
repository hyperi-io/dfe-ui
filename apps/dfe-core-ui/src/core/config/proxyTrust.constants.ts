/**
 * Proxy-trust constants with no server-only deps (no jose), safe to import from
 * client components and middleware without bloating those bundles.
 */

/** NextAuth provider id for the proxy-trust CredentialsProvider. */
export const PROXY_TRUST_PROVIDER_ID = 'proxy-trust';

/** Cookie the single-origin proxy sets carrying the engine's ES384 JWT. */
export const DFE_TOKEN_COOKIE = 'dfe_token';
