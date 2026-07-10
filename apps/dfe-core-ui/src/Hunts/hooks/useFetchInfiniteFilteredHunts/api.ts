import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFilteredHuntsPath = API_CONFIG.hunts.default;

export const fetchInfiniteFilteredHunts = (
  options?: DfeClientRequestOptions<
    typeof fetchInfiniteFilteredHuntsPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteFilteredHuntsPath, options);
