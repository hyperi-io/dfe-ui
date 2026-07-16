import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const testOidcProviderPath = API_CONFIG.oidc_providers.test;

export const testOidcProvider = (
  options: DfeClientRequestOptions<typeof testOidcProviderPath, 'get'>,
) => apiClient.get(testOidcProviderPath, options);
