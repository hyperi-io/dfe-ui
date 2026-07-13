import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const refreshTokenPath = API_CONFIG.auth.refresh;

export const refreshToken = (
  options?: DfeClientRequestOptions<typeof refreshTokenPath, 'post'>,
) => apiClient.post(refreshTokenPath, options);
