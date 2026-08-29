import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appScalingPath = API_CONFIG.apps.scaling;

export const fetchAppScalingApi = (
  options: DfeClientRequestOptions<typeof appScalingPath, 'get'>,
) => apiClient.get(appScalingPath, options);
