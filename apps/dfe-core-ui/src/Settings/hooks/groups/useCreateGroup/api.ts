import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createGroupPath = API_CONFIG.groups.default;

export const createGroup = (
  options: DfeClientRequestOptions<typeof createGroupPath, 'post'>,
) => apiClient.post(createGroupPath, options);
