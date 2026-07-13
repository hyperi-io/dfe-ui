import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFilteredRoleScopesPath = API_CONFIG.roles.scopes;

export const fetchInfiniteFilteredRoleScopes = (
  options: DfeClientRequestOptions<
    typeof fetchInfiniteFilteredRoleScopesPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteFilteredRoleScopesPath, options);
