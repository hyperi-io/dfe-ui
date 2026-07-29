import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteDeploymentPath = API_CONFIG.deployments.deployment;

export const deleteDeployment = (
  options: DfeClientRequestOptions<typeof deleteDeploymentPath, 'delete'>,
) => apiClient.delete(deleteDeploymentPath, options);
