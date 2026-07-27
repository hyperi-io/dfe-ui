import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteOidcProviderPath = API_CONFIG.oidcProviders.provider;

export const deleteOidcProvider = (
  options: DfeClientRequestOptions<typeof deleteOidcProviderPath, 'delete'>,
) => apiClient.delete(deleteOidcProviderPath, options);
