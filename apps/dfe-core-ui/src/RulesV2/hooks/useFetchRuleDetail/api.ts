import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchRuleDetailPath = API_CONFIG.rulesV2.rule;

export const fetchRuleDetail = (
  options: DfeClientRequestOptions<typeof fetchRuleDetailPath, 'get'>,
) => apiClient.get(fetchRuleDetailPath, options);
