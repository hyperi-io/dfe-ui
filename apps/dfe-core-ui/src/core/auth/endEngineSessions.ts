import { API_CONFIG } from '@/core/config/api/endpoints';

// A sign-out must not hang on an engine that is down; the local sign-out goes ahead regardless.
const LOGOUT_TIMEOUT_MS = 5000;

/**
 * Asks the engine to end every session of the token's account. Best-effort:
 * true only on the engine's 2xx, false on a refusal, an old engine without the
 * route, or no answer in time.
 */
export async function endEngineSessions(
  accessToken: string,
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const res = await fetchImpl(`${baseUrl}${API_CONFIG.auth.logout}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(LOGOUT_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}
