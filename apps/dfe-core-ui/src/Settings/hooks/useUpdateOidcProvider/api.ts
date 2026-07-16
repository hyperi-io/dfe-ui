import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateOidcProviderPath = API_CONFIG.oidc_providers.provider;

export const updateOidcProvider = (
  options: DfeClientRequestOptions<typeof updateOidcProviderPath, 'put'>,
) => apiClient.put(updateOidcProviderPath, options);
