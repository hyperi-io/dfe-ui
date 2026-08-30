import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const backingServicesPath = API_CONFIG.backingServices.default;

export const fetchBackingServicesApi = (
  options?: DfeClientRequestOptions<typeof backingServicesPath, 'get'>,
) => apiClient.get(backingServicesPath, options);
