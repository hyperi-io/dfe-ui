import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchHuntExecutionsPath = API_CONFIG.hunts.huntExecutions;

export const fetchHuntExecutions = (
  options?: DfeClientRequestOptions<typeof fetchHuntExecutionsPath, 'get'>,
) => apiClient.get(fetchHuntExecutionsPath, options);
