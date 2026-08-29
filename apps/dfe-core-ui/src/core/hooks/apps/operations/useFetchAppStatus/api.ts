import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appStatusPath = API_CONFIG.apps.status;

export const fetchAppStatusApi = (
  options: DfeClientRequestOptions<typeof appStatusPath, 'get'>,
) => apiClient.get(appStatusPath, options);
