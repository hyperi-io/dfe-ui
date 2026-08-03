import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateDeploymentPath = API_CONFIG.deployments.deployment;

export const updateDeployment = (
  options: DfeClientRequestOptions<typeof updateDeploymentPath, 'put'>,
) => apiClient.put(updateDeploymentPath, options);
