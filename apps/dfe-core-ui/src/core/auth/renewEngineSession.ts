import { API_CONFIG } from '@/core/config/api/endpoints';
import type { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { decodeJwt } from 'jose';
import type { JWT } from 'next-auth/jwt';

const readJson = async <T>(res: Response): Promise<T | null> =>
  res.ok && res.headers.get('content-type')?.includes('application/json')
    ? ((await res.json()) as T)
    : null;

/** When the token itself says it expires, in epoch ms; the engine's expires_in otherwise. */
function expiresAtOf(token: string, expiresIn: number | undefined): number {
  try {
    const { exp } = decodeJwt(token);
    if (typeof exp === 'number') {
      return exp * 1000;
    }
  } catch {
    // The engine minted it; an unreadable claim set only loses the precise expiry.
  }
  return Date.now() + (expiresIn ?? 0) * 1000;
}

/**
 * Renews the session's engine token server-side: the engine refreshes the token
 * the session already holds, then /auth/me names its roles. Nothing the browser
 * sent is read, so a caller cannot choose its token, roles, lifetime or
 * password standing.
 */
export async function renewEngineSession(
  token: JWT,
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<JWT> {
  const current = token.accessToken;
  if (typeof current !== 'string' || current === '') {
    return { ...token, error: 'AccessTokenExpired' };
  }

  let refreshed: TRefreshTokenResponse | null;
  try {
    refreshed = await readJson<TRefreshTokenResponse>(
      await fetchImpl(`${baseUrl}${API_CONFIG.auth.refresh}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${current}` },
      }),
    );
  } catch {
    refreshed = null;
  }
  if (!refreshed?.access_token) {
    return { ...token, error: 'AccessTokenExpired' };
  }

  let roles = refreshed.roles ?? [];
  try {
    const me = await readJson<{ roles?: string[] }>(
      await fetchImpl(`${baseUrl}${API_CONFIG.auth.me}`, {
        headers: { Authorization: `Bearer ${refreshed.access_token}` },
      }),
    );
    if (me?.roles) {
      roles = me.roles;
    }
  } catch {
    // The refresh answer already carries the engine's live roles.
  }

  const renewed: JWT = {
    ...token,
    accessToken: refreshed.access_token,
    accessTokenExpiresAt: expiresAtOf(
      refreshed.access_token,
      refreshed.expires_in,
    ),
    roles,
    passwordChangeRequired: refreshed.password_change_required === true,
  };
  delete renewed.error;
  return renewed;
}
