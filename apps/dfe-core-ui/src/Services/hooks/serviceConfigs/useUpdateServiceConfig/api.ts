import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateServiceConfigPath = API_CONFIG.serviceConfigs.instance;

export const updateServiceConfig = (
  options: DfeClientRequestOptions<typeof updateServiceConfigPath, 'put'>,
) => apiClient.put(updateServiceConfigPath, options);
