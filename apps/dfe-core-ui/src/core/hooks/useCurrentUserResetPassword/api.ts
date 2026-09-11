import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const resetCurrentUserPasswordPath =
  API_CONFIG.accounts.resetCurrentUserPassword;

export const resetCurrentUserPassword = (
  options: DfeClientRequestOptions<typeof resetCurrentUserPasswordPath, 'post'>,
) => apiClient.post(resetCurrentUserPasswordPath, options);
