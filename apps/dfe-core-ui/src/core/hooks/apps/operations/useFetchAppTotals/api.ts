import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appMetricsTotalsPath = API_CONFIG.apps.metricsTotals;

export const fetchAppTotalsApi = (
  options: DfeClientRequestOptions<typeof appMetricsTotalsPath, 'get'>,
) => apiClient.get(appMetricsTotalsPath, options);
