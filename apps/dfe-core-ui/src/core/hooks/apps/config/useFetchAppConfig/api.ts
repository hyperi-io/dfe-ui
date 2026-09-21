import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appConfigPath = API_CONFIG.apps.config;

export const fetchAppConfigApi = (
  options: DfeClientRequestOptions<typeof appConfigPath, 'get'>,
) => apiClient.get(appConfigPath, options);
