import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateAlertPath = API_CONFIG.alerts.destination;

export const updateAlert = (
  options: DfeClientRequestOptions<typeof updateAlertPath, 'put'>,
) => apiClient.put(updateAlertPath, options);
