import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteAlertPath = API_CONFIG.alerts.destination;

export const deleteAlert = (
  options?: DfeClientRequestOptions<typeof deleteAlertPath, 'delete'>,
) => apiClient.delete(deleteAlertPath, options);
