import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteAccountPath = API_CONFIG.accounts.account;

export const deleteAccount = (
  options: DfeClientRequestOptions<typeof deleteAccountPath, 'delete'>,
) => apiClient.delete(deleteAccountPath, options);
