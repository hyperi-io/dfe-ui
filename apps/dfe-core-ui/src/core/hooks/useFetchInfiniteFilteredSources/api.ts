import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchSourcesPath = API_CONFIG.sources.default;

export const fetchInfiniteFilteredSources = (
  options: DfeClientRequestOptions<typeof fetchSourcesPath, 'get'>,
) => apiClient.get(fetchSourcesPath, options);
