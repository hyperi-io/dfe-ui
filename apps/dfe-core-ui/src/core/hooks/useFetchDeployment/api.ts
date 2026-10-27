import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemDeploymentPath = API_CONFIG.system.deployment;

export const fetchSystemDeploymentApi = () =>
  apiClient.get(systemDeploymentPath);
