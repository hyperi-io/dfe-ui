import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governancePolicyPath = API_CONFIG.governance.adminPolicies;

export const createGovernancePolicyApi = (
  options: DfeClientRequestOptions<typeof governancePolicyPath, 'post'>,
) => apiClient.post(governancePolicyPath, options);
