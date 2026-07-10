/**
 * Proxy-trust auth mode helpers (single-origin behind Envoy).
 *
 * In proxy mode Envoy fronts dfe-ui + the engine + hyperdx on one origin and
 * forwards the engine's verified ES384 JWT (as a `dfe_token` cookie and/or an
 * Authorization Bearer header). dfe-ui establishes its NextAuth session by
 * RE-VERIFYING that token against the engine JWKS (defence in depth) and
 * reading the identity claims - it does NOT re-authenticate with a password.
 *
 * When no engine token is present (local dev, no proxy) callers fall back to
 * the default NextAuth CredentialsProvider flow, unchanged. Everything here is
 * gated on DFE_AUTH_MODE=proxy so local-dev credentials keep working.
 */

import {
  DFE_TOKEN_COOKIE,
  PROXY_TRUST_PROVIDER_ID,
} from '@/core/config/proxyTrust.constants';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Re-exported so existing importers of '@/core/config/proxyTrust' are unchanged.
export { DFE_TOKEN_COOKIE, PROXY_TRUST_PROVIDER_ID };

/** Engine tokens are signed ES384 (asymmetric, JWKS-verifiable). */
const ENGINE_JWT_ALG = 'ES384';

/**
 * True when the app is deployed behind the proxy (single origin).
 * Server env DFE_AUTH_MODE is authoritative; NEXT_PUBLIC_DFE_AUTH_MODE is the
 * client-visible mirror so the browser can decide to auto-trigger sign-in.
 */
export function isProxyAuthMode(): boolean {
  const mode =
    process.env.DFE_AUTH_MODE ?? process.env.NEXT_PUBLIC_DFE_AUTH_MODE;
  return mode === 'proxy';
}

/** JWKS endpoint exposing the engine's ES384 public keys. */
function engineJwksUrl(): string | undefined {
  return (
    process.env.DFE_ENGINE_JWKS_URL ??
    process.env.NEXT_PUBLIC_DFE_ENGINE_JWKS_URL ??
    undefined
  );
}

/** Expected token issuer (optional; enforced when set). */
function engineJwtIssuer(): string | undefined {
  return (
    process.env.DFE_ENGINE_JWT_ISSUER ??
    process.env.NEXT_PUBLIC_DFE_ENGINE_JWT_ISSUER ??
    undefined
  );
}

/**
 * Remote JWK sets are cached per URL across invocations - createRemoteJWKSet
 * keeps its own key cache + rotation handling, so we reuse one instance.
 */
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getRemoteJwks(url: string): ReturnType<typeof createRemoteJWKSet> {
  let jwks = jwksCache.get(url);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
    jwksCache.set(url, jwks);
  }
  return jwks;
}

/** Identity resolved from a verified engine token. Shape matches NextAuth User. */
export interface ProxyTrustUser {
  id: string;
  name: string;
  email?: string;
  roles: string[];
  groups: string[];
  accessToken: string;
  expiresIn: number;
}

/** Minimal request shape NextAuth hands to CredentialsProvider.authorize. */
type AuthorizeRequest = {
  headers?: Record<string, string> | undefined;
};

/** Parse a single cookie value out of a raw Cookie header. */
function readCookie(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.split('=');
    if (rawKey?.trim() === name) {
      return decodeURIComponent(rest.join('=').trim());
    }
  }
  return null;
}

/**
 * Extract the engine token from the incoming request: an Authorization Bearer
 * header takes precedence, otherwise the `dfe_token` cookie. Both are set by
 * the proxy on the single origin.
 */
export function extractEngineToken(
  req: AuthorizeRequest | undefined,
  credentials?: Record<string, string> | undefined,
): string | null {
  // Explicitly-passed token (e.g. signIn('proxy-trust', { token })) wins.
  if (credentials?.token) return credentials.token;

  const headers = req?.headers;
  if (!headers) return null;

  const authHeader = headers.authorization ?? headers.Authorization;
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return readCookie(headers.cookie ?? headers.Cookie, DFE_TOKEN_COOKIE);
}

/**
 * Verify an engine ES384 JWT against the engine JWKS and map its claims to a
 * NextAuth user. Returns null on any failure (missing config, bad signature,
 * wrong issuer/alg, expired) so authorize() can reject cleanly.
 */
export async function verifyEngineToken(
  token: string,
): Promise<ProxyTrustUser | null> {
  const url = engineJwksUrl();
  if (!url) {
    // Misconfiguration - fail closed rather than trust an unverifiable token.
    return null;
  }

  try {
    const issuer = engineJwtIssuer();
    const { payload } = await jwtVerify(token, getRemoteJwks(url), {
      algorithms: [ENGINE_JWT_ALG],
      ...(issuer ? { issuer } : {}),
    });

    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) return null;

    const roles = Array.isArray(payload.roles)
      ? (payload.roles as unknown[]).filter(
          (r): r is string => typeof r === 'string',
        )
      : [];
    const groups = Array.isArray(payload.groups)
      ? (payload.groups as unknown[]).filter(
          (g): g is string => typeof g === 'string',
        )
      : [];
    const email = typeof payload.email === 'string' ? payload.email : undefined;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresIn =
      typeof payload.exp === 'number' && payload.exp > nowSeconds
        ? payload.exp - nowSeconds
        : 3600;

    return {
      id: sub,
      name: sub,
      email,
      // Session roles drive UI gating; fall back to groups when roles absent.
      roles: roles.length > 0 ? roles : groups,
      groups,
      accessToken: token,
      expiresIn,
    };
  } catch {
    return null;
  }
}
