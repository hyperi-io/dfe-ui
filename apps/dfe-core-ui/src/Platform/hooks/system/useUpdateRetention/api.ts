import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const retentionPath = API_CONFIG.system.retention;

export const updateRetentionApi = (
  options: DfeClientRequestOptions<typeof retentionPath, 'put'>,
) => apiClient.put(retentionPath, options);
