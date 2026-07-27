import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteRolePath = API_CONFIG.roles.role;

export const deleteRole = (
  options: DfeClientRequestOptions<typeof deleteRolePath, 'delete'>,
) => apiClient.delete(deleteRolePath, options);
