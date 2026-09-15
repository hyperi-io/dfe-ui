import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchTableEnginesPath = API_CONFIG.sources.engines;

export const fetchTableEngines = (
  options: DfeClientRequestOptions<typeof fetchTableEnginesPath, 'get'>,
) => apiClient.get(fetchTableEnginesPath, options);
