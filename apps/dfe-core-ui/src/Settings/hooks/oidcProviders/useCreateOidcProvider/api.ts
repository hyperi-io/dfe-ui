import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createOidcProviderPath = API_CONFIG.oidcProviders.default;

export const createOidcProviderApi = (
  options: DfeClientRequestOptions<typeof createOidcProviderPath, 'post'>,
) => apiClient.post(createOidcProviderPath, options);
