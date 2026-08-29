import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appMetricsPath = API_CONFIG.apps.metrics;

export const fetchAppMetricsApi = (
  options: DfeClientRequestOptions<typeof appMetricsPath, 'get'>,
) => apiClient.get(appMetricsPath, options);
