import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchHuntDetailPath = API_CONFIG.hunts.hunt;

export const fetchHuntDetail = (
  options?: DfeClientRequestOptions<typeof fetchHuntDetailPath, 'get'>,
) => apiClient.get(fetchHuntDetailPath, options);
