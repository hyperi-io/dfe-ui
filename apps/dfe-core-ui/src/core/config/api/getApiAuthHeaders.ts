import { getSession } from 'next-auth/react';

export async function getApiAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
