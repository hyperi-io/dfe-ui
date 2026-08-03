import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const seedServiceConfigsPath = API_CONFIG.serviceConfigs.seed;

export const seedServiceConfigs = (
  options: DfeClientRequestOptions<typeof seedServiceConfigsPath, 'post'> = {},
) => apiClient.post(seedServiceConfigsPath, options);
