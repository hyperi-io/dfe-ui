import { createApiClient } from './client';
import { getApiAuthHeaders } from './getApiAuthHeaders';
import { handleApiUnauthorized } from './handleApiUnauthorized';
import { handlePasswordChangeRequired } from './handlePasswordChangeRequired';

export const apiClient = createApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : process.env.INTERNAL_API_URL) ||
    '',
  getAuthHeaders: getApiAuthHeaders,
  onUnauthorized: handleApiUnauthorized,
  onPasswordChangeRequired: handlePasswordChangeRequired,
});
