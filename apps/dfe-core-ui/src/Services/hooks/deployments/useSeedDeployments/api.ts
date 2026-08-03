import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const seedDeploymentsPath = API_CONFIG.deployments.seed;

export const seedDeployments = (
  options: DfeClientRequestOptions<typeof seedDeploymentsPath, 'post'> = {},
) => apiClient.post(seedDeploymentsPath, options);
