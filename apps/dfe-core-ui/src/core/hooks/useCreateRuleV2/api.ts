import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createRulePath = API_CONFIG.rulesV2.default;

export const createRule = (
  options: DfeClientRequestOptions<typeof createRulePath, 'post'>,
) => apiClient.post(createRulePath, options);
