import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceActionInvokePath = API_CONFIG.governance.invokeAction;

export const invokeGovernanceActionApi = (
  options: DfeClientRequestOptions<typeof governanceActionInvokePath, 'post'>,
) => apiClient.post(governanceActionInvokePath, options);
