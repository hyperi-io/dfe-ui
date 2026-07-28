import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteServiceConfigPath = API_CONFIG.serviceConfigs.instance;

export const deleteServiceConfig = (
  options: DfeClientRequestOptions<typeof deleteServiceConfigPath, 'delete'>,
) => apiClient.delete(deleteServiceConfigPath, options);
