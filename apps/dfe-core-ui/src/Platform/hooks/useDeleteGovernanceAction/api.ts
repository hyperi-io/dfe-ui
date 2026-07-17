import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceActionPath = API_CONFIG.governance.adminAction;

export const deleteGovernanceActionApi = (
  options: DfeClientRequestOptions<typeof governanceActionPath, 'delete'>,
) => apiClient.delete(governanceActionPath, options);
