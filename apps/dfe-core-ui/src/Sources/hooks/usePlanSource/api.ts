import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourcePlanPath = API_CONFIG.sources.plan;
export const planSource = (
  options: DfeClientRequestOptions<typeof sourcePlanPath, 'post'>,
) => apiClient.post(sourcePlanPath, options);
