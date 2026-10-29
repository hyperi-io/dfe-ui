import { API_CONFIG } from '@/core/config/api/endpoints';
import { ENGINE_CALL_TIMEOUT_MS } from '@/core/config/engineTimeout';

/**
 * The permissions the engine grants an access token, read server-side.
 *
 * Any failure reads as none, so the caller falls back to its default rather
 * than holding the page on an engine that did not answer.
 */
export const getAuthPermissions = async (
  accessToken: string | undefined,
): Promise<string[]> => {
  const baseUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || !accessToken) {
    return [];
  }
  try {
    const response = await fetch(`${baseUrl}${API_CONFIG.auth.permissions}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(ENGINE_CALL_TIMEOUT_MS),
    });
    if (!response.ok) {
      return [];
    }
    const body: unknown = await response.json();
    const permissions =
      typeof body === 'object' && body !== null && 'permissions' in body
        ? body.permissions
        : undefined;
    return Array.isArray(permissions)
      ? permissions.filter((p): p is string => typeof p === 'string')
      : [];
  } catch {
    return [];
  }
};
