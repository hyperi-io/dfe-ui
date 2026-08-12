import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const resetPasswordPath = API_CONFIG.accounts.resetPassword;

export const resetPassword = (
  options: DfeClientRequestOptions<typeof resetPasswordPath, 'post'>,
) => apiClient.post(resetPasswordPath, options);
