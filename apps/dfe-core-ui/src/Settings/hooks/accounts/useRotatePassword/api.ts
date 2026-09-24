import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const rotatePasswordPath = API_CONFIG.accounts.rotatePassword;

export const rotatePassword = (
  options: DfeClientRequestOptions<typeof rotatePasswordPath, 'post'>,
) => apiClient.post(rotatePasswordPath, options);
