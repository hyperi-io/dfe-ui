import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFilteredRolesPath = API_CONFIG.roles.default;

export const fetchInfiniteFilteredRoles = (
  options: DfeClientRequestOptions<
    typeof fetchInfiniteFilteredRolesPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteFilteredRolesPath, options);
