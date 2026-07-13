import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFieldMapsPath = API_CONFIG.fieldMaps.default;

export const fetchInfiniteFieldMaps = (
  options: DfeClientRequestOptions<typeof fetchInfiniteFieldMapsPath, 'get'>,
) => apiClient.get(fetchInfiniteFieldMapsPath, options);
