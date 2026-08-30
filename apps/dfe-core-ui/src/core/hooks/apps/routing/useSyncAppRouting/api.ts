import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appRoutingSyncPath = API_CONFIG.apps.routingSync;

export const syncAppRoutingApi = (
  options: DfeClientRequestOptions<typeof appRoutingSyncPath, 'post'>,
) => apiClient.post(appRoutingSyncPath, options);
