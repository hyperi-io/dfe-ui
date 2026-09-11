import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateCurrentUserPath = API_CONFIG.accounts.me;

export const updateCurrentUser = (
  options: DfeClientRequestOptions<typeof updateCurrentUserPath, 'put'>,
) => apiClient.put(updateCurrentUserPath, options);
