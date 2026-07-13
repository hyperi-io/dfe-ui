import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateRulePath = API_CONFIG.rules.rule;

export const updateRule = (
  options: DfeClientRequestOptions<typeof updateRulePath, 'put'>,
) => apiClient.put(updateRulePath, options);
