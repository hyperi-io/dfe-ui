import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchAccountDetailPath = API_CONFIG.accounts.account;

export const fetchAccountDetail = (
  options: DfeClientRequestOptions<typeof fetchAccountDetailPath, 'get'>,
) => apiClient.get(fetchAccountDetailPath, options);
