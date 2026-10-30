import { API_CONFIG } from '@/core/config/api/endpoints';
import {
  ENGINE_CALL_TIMEOUT_MS,
  GATEWAY_UNAVAILABLE_STATUSES,
} from '@/core/config/engineTimeout';
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

  // An engine that did not answer has not refused the token, so a session whose
  // token still works keeps it and the next scheduled check asks again.
  const stillValid =
    typeof token.accessTokenExpiresAt === 'number' &&
    Date.now() < token.accessTokenExpiresAt;

  let refreshed: TRefreshTokenResponse | null;
  try {
    const response = await fetchImpl(`${baseUrl}${API_CONFIG.auth.refresh}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${current}` },
      signal: AbortSignal.timeout(ENGINE_CALL_TIMEOUT_MS),
    });
    if (GATEWAY_UNAVAILABLE_STATUSES.has(response.status) && stillValid) {
      return token;
    }
    refreshed = await readJson<TRefreshTokenResponse>(response);
  } catch {
    if (stillValid) return token;
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
        signal: AbortSignal.timeout(ENGINE_CALL_TIMEOUT_MS),
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
