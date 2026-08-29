import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appsPath = API_CONFIG.apps.default;

export const fetchAppsApi = (
  options?: DfeClientRequestOptions<typeof appsPath, 'get'>,
) => apiClient.get(appsPath, options);
