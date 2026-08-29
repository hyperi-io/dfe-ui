import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appHistoryPath = API_CONFIG.apps.history;

export const fetchAppHistoryApi = (
  options: DfeClientRequestOptions<typeof appHistoryPath, 'get'>,
) => apiClient.get(appHistoryPath, options);
