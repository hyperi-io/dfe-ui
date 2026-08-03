import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceConfigsPath = API_CONFIG.serviceConfigs.default;

export const fetchInfiniteFilteredServiceConfigs = (
  options: DfeClientRequestOptions<typeof fetchServiceConfigsPath, 'get'>,
) => apiClient.get(fetchServiceConfigsPath, options);
