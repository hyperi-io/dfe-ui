import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchDeploymentDetailPath = API_CONFIG.deployments.deployment;

export const fetchDeploymentDetail = (
  options: DfeClientRequestOptions<typeof fetchDeploymentDetailPath, 'get'>,
) => apiClient.get(fetchDeploymentDetailPath, options);
