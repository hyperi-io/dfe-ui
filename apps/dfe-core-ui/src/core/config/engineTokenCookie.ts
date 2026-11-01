import type { JWT } from 'next-auth/jwt';

/** Cookie mirroring the session's engine token so the embedded HyperDX authenticates as the same user. */
export const DFE_TOKEN_COOKIE = 'dfe_token';

/**
 * Parent domain the dfe_token cookie is scoped to so it reaches the HyperDX
 * iframe subdomain. Empty leaves the cookie host-only (single-origin / docker).
 */
export function engineTokenCookieDomain(): string | undefined {
  const domain = process.env.DFE_COOKIE_DOMAIN;
  return domain && domain.trim() !== '' ? domain.trim() : undefined;
}

/**
 * Set-Cookie values that expire the dfe_token on sign-out: the Domain-scoped one
 * the console plants, and the host-only one the engine's OIDC callback sets.
 * Name, Domain and Path must match the planted cookie or the browser keeps it.
 */
export function expiredEngineTokenCookies(secure: boolean): string[] {
  const attributes = [
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ');
  const hostOnly = `${DFE_TOKEN_COOKIE}=; ${attributes}`;
  const domain = engineTokenCookieDomain();
  return domain
    ? [`${DFE_TOKEN_COOKIE}=; Domain=${domain}; ${attributes}`, hostOnly]
    : [hostOnly];
}

/**
 * The dfe_token cookie a session's engine token earns, or null when it earns
 * none: no token, or an account that must still change its issued password and
 * so may use nothing yet. The cookie lives exactly as long as the token does.
 */
export function engineTokenCookieFor(token: JWT | null, secure: boolean) {
  const accessToken = token?.accessToken;
  if (typeof accessToken !== 'string' || accessToken === '') {
    return null;
  }
  if (token?.passwordChangeRequired === true) {
    return null;
  }

  const expiresAt =
    typeof token?.accessTokenExpiresAt === 'number'
      ? token.accessTokenExpiresAt
      : undefined;

  return {
    name: DFE_TOKEN_COOKIE,
    value: accessToken,
    domain: engineTokenCookieDomain(),
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    maxAge:
      expiresAt !== undefined
        ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
        : undefined,
  };
}
