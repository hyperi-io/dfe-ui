import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchDeploymentsPath = API_CONFIG.deployments.default;

export const fetchDeployments = (
  options?: DfeClientRequestOptions<typeof fetchDeploymentsPath, 'get'>,
) => apiClient.get(fetchDeploymentsPath, options);
