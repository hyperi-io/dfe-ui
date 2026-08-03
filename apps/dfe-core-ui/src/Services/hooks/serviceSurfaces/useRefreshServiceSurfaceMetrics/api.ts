import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const refreshServiceSurfaceMetricsPath =
  API_CONFIG.serviceSurfaces.refreshMetrics;

export const refreshServiceSurfaceMetrics = (
  options: DfeClientRequestOptions<
    typeof refreshServiceSurfaceMetricsPath,
    'post'
  >,
) => apiClient.post(refreshServiceSurfaceMetricsPath, options);
