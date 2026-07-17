import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceActionDetailPath = API_CONFIG.governance.action;

export const governanceActionDetailApi = (
  options: DfeClientRequestOptions<typeof governanceActionDetailPath, 'get'>,
) => apiClient.get(governanceActionDetailPath, options);
