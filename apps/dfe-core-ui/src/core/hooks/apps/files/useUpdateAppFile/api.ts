import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateAppFilePath = API_CONFIG.apps.file;

export const updateAppFileApi = (
  options: DfeClientRequestOptions<typeof updateAppFilePath, 'put'>,
) => apiClient.put(updateAppFilePath, options);
