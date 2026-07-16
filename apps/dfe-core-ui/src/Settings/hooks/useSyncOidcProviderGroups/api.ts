import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateOidcProviderGroupsPath =
  API_CONFIG.oidc_providers.syncGroups;

export const updateOidcProviderGroups = (
  options: DfeClientRequestOptions<typeof updateOidcProviderGroupsPath, 'post'>,
) => apiClient.post(updateOidcProviderGroupsPath, options);
