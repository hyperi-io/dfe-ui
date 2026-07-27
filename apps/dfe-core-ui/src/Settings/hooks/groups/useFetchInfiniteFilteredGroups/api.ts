import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchGroupsPath = API_CONFIG.groups.default;

export const fetchGroups = (
  options?: DfeClientRequestOptions<typeof fetchGroupsPath, 'get'>,
) => apiClient.get(fetchGroupsPath, options);
