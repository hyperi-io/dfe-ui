import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appPath = API_CONFIG.apps.app;

export const fetchAppDetailApi = (
  options: DfeClientRequestOptions<typeof appPath, 'get'>,
) => apiClient.get(appPath, options);
