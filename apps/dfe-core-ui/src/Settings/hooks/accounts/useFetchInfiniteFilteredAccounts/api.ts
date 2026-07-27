import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchAccountsPath = API_CONFIG.accounts.default;

export const fetchAccounts = (
  options?: DfeClientRequestOptions<typeof fetchAccountsPath, 'get'>,
) => apiClient.get(fetchAccountsPath, options);
