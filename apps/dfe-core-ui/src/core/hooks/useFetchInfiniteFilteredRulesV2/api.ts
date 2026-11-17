import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteRulesPath = API_CONFIG.rulesV2.default;

export const fetchInfiniteRules = (
  options: DfeClientRequestOptions<typeof fetchInfiniteRulesPath, 'get'>,
) => apiClient.get(fetchInfiniteRulesPath, options);
