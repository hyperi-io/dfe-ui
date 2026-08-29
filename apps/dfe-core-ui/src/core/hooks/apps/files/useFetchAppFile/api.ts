import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFilePath = API_CONFIG.apps.file;

export const fetchAppFileApi = (
  options: DfeClientRequestOptions<typeof appFilePath, 'get'>,
) => apiClient.get(appFilePath, options);
