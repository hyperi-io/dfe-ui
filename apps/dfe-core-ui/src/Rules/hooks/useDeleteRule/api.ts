import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteRulePath = API_CONFIG.rules.rule;

export const deleteRule = (
  options: DfeClientRequestOptions<typeof deleteRulePath, 'delete'>,
) => apiClient.delete(deleteRulePath, options);
