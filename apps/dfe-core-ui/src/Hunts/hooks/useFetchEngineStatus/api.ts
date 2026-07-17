import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchEngineStatusPath = API_CONFIG.hunts.engineStatus;

export const fetchEngineStatus = (
  options?: DfeClientRequestOptions<typeof fetchEngineStatusPath, 'get'>,
) => apiClient.get(fetchEngineStatusPath, options);
