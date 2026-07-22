import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governancePolicyDetailPath = API_CONFIG.governance.policy;

export const governancePolicyDetailApi = (
  options: DfeClientRequestOptions<typeof governancePolicyDetailPath, 'get'>,
) => apiClient.get(governancePolicyDetailPath, options);
