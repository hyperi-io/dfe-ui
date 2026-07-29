import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const validateDeploymentPath = API_CONFIG.deployments.validate;

export const validateDeployment = (
  options: DfeClientRequestOptions<typeof validateDeploymentPath, 'post'>,
) => apiClient.post(validateDeploymentPath, options);
