import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createAccountPath = API_CONFIG.accounts.default;

export const createAccount = (
  options: DfeClientRequestOptions<typeof createAccountPath, 'post'>,
) => apiClient.post(createAccountPath, options);
