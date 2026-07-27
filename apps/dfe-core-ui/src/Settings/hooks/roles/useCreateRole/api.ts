import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createRolePath = API_CONFIG.roles.default;

export const createRole = (
  options: DfeClientRequestOptions<typeof createRolePath, 'post'>,
) => apiClient.post(createRolePath, options);
