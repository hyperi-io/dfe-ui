import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appInstancesPath = API_CONFIG.apps.instances;

export const createAppInstanceApi = (
  options: DfeClientRequestOptions<typeof appInstancesPath, 'post'>,
) => apiClient.post(appInstancesPath, options);
