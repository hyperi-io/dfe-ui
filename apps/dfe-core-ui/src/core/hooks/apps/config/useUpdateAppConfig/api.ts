import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateAppConfigPath = API_CONFIG.apps.config;

export const updateAppConfigApi = (
  options: DfeClientRequestOptions<typeof updateAppConfigPath, 'put'>,
) => apiClient.put(updateAppConfigPath, options);
