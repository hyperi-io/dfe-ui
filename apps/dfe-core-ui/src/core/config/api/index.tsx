import { createApiClient } from './client';
import { getApiAuthHeaders } from './getApiAuthHeaders';
import { handleApiUnauthorized } from './handleApiUnauthorized';

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  getAuthHeaders: getApiAuthHeaders,
  onUnauthorized: handleApiUnauthorized,
});
