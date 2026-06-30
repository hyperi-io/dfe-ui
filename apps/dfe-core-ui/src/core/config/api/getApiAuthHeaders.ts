import {
  getAccessTokenFromCache,
  loadSession,
} from '@/core/auth/cachedSession';

export async function getApiAuthHeaders(): Promise<HeadersInit> {
  const cachedToken = getAccessTokenFromCache();
  if (cachedToken) {
    return {
      Authorization: `Bearer ${cachedToken}`,
    };
  }

  const session = await loadSession();
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
