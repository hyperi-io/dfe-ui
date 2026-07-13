import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const triggerHuntPath = API_CONFIG.hunts.huntRun;

export const triggerHunt = (
  options?: DfeClientRequestOptions<typeof triggerHuntPath, 'post'>,
) => apiClient.post(triggerHuntPath, options);
