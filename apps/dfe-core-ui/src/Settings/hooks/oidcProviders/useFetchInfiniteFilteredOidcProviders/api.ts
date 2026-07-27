import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFilteredOidcProvidersPath =
  API_CONFIG.oidcProviders.default;

export const fetchInfiniteFilteredOidcProvidersApi = (
  options: DfeClientRequestOptions<
    typeof fetchInfiniteFilteredOidcProvidersPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteFilteredOidcProvidersPath, options);
