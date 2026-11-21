import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const unlinkIdentityPath = API_CONFIG.accounts.identity;

export const unlinkIdentity = (
  options: DfeClientRequestOptions<typeof unlinkIdentityPath, 'delete'>,
) => apiClient.delete(unlinkIdentityPath, options);
