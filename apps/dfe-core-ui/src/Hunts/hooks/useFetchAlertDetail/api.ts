import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchAlertDetailPath = API_CONFIG.alerts.destination;

export const fetchAlertDetail = (
  options?: DfeClientRequestOptions<typeof fetchAlertDetailPath, 'get'>,
) => apiClient.get(fetchAlertDetailPath, options);
