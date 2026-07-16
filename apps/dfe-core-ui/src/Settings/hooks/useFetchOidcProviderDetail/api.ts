import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchOidcProviderDetailPath = API_CONFIG.oidc_providers.provider;

export const fetchOidcProviderDetailApi = (
  options: DfeClientRequestOptions<typeof fetchOidcProviderDetailPath, 'get'>,
) => apiClient.get(fetchOidcProviderDetailPath, options);
