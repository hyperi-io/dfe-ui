import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteAppPath = API_CONFIG.apps.app;

export const deleteAppInstanceApi = (
  options: DfeClientRequestOptions<typeof deleteAppPath, 'delete'>,
) => apiClient.delete(deleteAppPath, options);
