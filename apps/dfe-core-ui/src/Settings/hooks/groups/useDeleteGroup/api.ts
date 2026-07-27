import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteGroupPath = API_CONFIG.groups.group;

export const deleteGroup = (
  options: DfeClientRequestOptions<typeof deleteGroupPath, 'delete'>,
) => apiClient.delete(deleteGroupPath, options);
