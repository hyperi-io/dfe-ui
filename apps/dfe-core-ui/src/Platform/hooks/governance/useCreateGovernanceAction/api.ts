import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceActionPath = API_CONFIG.governance.adminActions;

export const createGovernanceActionApi = (
  options: DfeClientRequestOptions<typeof governanceActionPath, 'post'>,
) => apiClient.post(governanceActionPath, options);
