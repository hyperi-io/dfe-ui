import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appRoutingPath = API_CONFIG.apps.routing;

export const fetchAppRoutingApi = (
  options: DfeClientRequestOptions<typeof appRoutingPath, 'get'>,
) => apiClient.get(appRoutingPath, options);
