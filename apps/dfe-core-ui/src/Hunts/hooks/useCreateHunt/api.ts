import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createHuntPath = API_CONFIG.hunts.default;

export const createHunt = (
  options?: DfeClientRequestOptions<typeof createHuntPath, 'post'>,
) => apiClient.post(createHuntPath, options);
