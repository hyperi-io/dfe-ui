import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchGroupDetailPath = API_CONFIG.groups.group;

export const fetchGroupDetail = (
  options: DfeClientRequestOptions<typeof fetchGroupDetailPath, 'get'>,
) => apiClient.get(fetchGroupDetailPath, options);
