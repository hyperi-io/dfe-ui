import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const lifecyclePath = API_CONFIG.lifecycle.lifecycle;

export const updateLifecycleApi = (
  options: DfeClientRequestOptions<typeof lifecyclePath, 'post'>,
) => apiClient.post(lifecyclePath, options);
