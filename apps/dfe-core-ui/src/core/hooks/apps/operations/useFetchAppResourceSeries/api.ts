import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appMetricsSeriesPath = API_CONFIG.apps.metricsSeries;

export const fetchAppResourceSeriesApi = (
  options: DfeClientRequestOptions<typeof appMetricsSeriesPath, 'get'>,
) => apiClient.get(appMetricsSeriesPath, options);
