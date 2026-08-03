import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const applyDeploymentSizePath = API_CONFIG.deployments.applySize;

export const applyDeploymentSize = (
  options: DfeClientRequestOptions<typeof applyDeploymentSizePath, 'post'>,
) => apiClient.post(applyDeploymentSizePath, options);
