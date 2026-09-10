import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourceFlowPath = API_CONFIG.sources.sourceFlow;

export const fetchSourceFlowApi = (
  options: DfeClientRequestOptions<typeof sourceFlowPath, 'get'>,
) => apiClient.get(sourceFlowPath, options);
