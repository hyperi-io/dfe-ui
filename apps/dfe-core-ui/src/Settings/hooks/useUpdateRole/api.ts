import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateRolePath = API_CONFIG.roles.role;

export const updateRole = (
  options: DfeClientRequestOptions<typeof updateRolePath, 'put'>,
) => apiClient.put(updateRolePath, options);
