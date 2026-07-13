import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteFilteredAlertsPath = API_CONFIG.alerts.destinations;

export const fetchInfiniteFilteredAlerts = (
  options?: DfeClientRequestOptions<
    typeof fetchInfiniteFilteredAlertsPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteFilteredAlertsPath, options);
