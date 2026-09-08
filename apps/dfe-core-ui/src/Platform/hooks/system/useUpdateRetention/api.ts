import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateSystemRetentionPath = API_CONFIG.system.retention;

export const updateSystemRetentionApi = (
  options: DfeClientRequestOptions<typeof updateSystemRetentionPath, 'put'>,
) => apiClient.put(updateSystemRetentionPath, options);
