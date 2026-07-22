import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governancePolicyPath = API_CONFIG.governance.adminPolicy;

export const deleteGovernancePolicyApi = (
  options: DfeClientRequestOptions<typeof governancePolicyPath, 'delete'>,
) => apiClient.delete(governancePolicyPath, options);
