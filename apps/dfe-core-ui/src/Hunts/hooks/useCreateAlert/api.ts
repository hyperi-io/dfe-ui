import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createAlertPath = API_CONFIG.alerts.destinations;

export const createAlert = (
  options?: DfeClientRequestOptions<typeof createAlertPath, 'post'>,
) => apiClient.post(createAlertPath, options);
