import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateAppScalingPath = API_CONFIG.apps.scaling;

export const updateAppScalingApi = (
  options: DfeClientRequestOptions<typeof updateAppScalingPath, 'put'>,
) => apiClient.put(updateAppScalingPath, options);
