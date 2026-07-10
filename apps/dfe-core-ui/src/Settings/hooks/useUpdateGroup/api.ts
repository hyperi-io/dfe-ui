import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateGroupPath = API_CONFIG.groups.group;

export const updateGroup = (
  options: DfeClientRequestOptions<typeof updateGroupPath, 'put'>,
) => apiClient.put(updateGroupPath, options);
