import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchRoleDetailPath = API_CONFIG.roles.role;

export const fetchRoleDetail = (
  options: DfeClientRequestOptions<typeof fetchRoleDetailPath, 'get'>,
) => apiClient.get(fetchRoleDetailPath, options);
