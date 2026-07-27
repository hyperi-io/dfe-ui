import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateAccountPath = API_CONFIG.accounts.account;

export const updateAccount = (
  options: DfeClientRequestOptions<typeof updateAccountPath, 'put'>,
) => apiClient.put(updateAccountPath, options);
