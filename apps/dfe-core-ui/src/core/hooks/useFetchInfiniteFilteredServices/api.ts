import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServicesPath = API_CONFIG.services.default;

export const fetchInfiniteFilteredServices = (
  options: DfeClientRequestOptions<typeof fetchServicesPath, 'get'>,
) => apiClient.get(fetchServicesPath, options);
