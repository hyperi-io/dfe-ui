import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFilesPath = API_CONFIG.apps.files;

export const fetchAppFilesApi = (
  options: DfeClientRequestOptions<typeof appFilesPath, 'get'>,
) => apiClient.get(appFilesPath, options);
