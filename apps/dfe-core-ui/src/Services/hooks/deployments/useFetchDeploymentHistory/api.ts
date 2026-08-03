import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchDeploymentHistoryPath = API_CONFIG.deployments.history;

export const fetchDeploymentHistory = (service: string, instance: string) =>
  apiClient.get(fetchDeploymentHistoryPath, {
    pathParams: {
      service,
      instance,
    },
  });
