import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateHuntPath = API_CONFIG.hunts.hunt;

export const updateHunt = (
  options: DfeClientRequestOptions<typeof updateHuntPath, 'put'>,
) => apiClient.put(updateHuntPath, options);
