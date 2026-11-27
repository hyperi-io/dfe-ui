import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const triggerOnDemandRulePath = API_CONFIG.rulesV2.run;

export const triggerOnDemandRule = (
  options: DfeClientRequestOptions<typeof triggerOnDemandRulePath, 'post'>,
) => apiClient.post(triggerOnDemandRulePath, options);
