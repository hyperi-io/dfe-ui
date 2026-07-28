import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceConfigDetailPath = API_CONFIG.serviceConfigs.instance;

export const fetchServiceConfigDetail = (service: string, instance: string) =>
  apiClient.get(fetchServiceConfigDetailPath, {
    pathParams: {
      service,
      instance,
    },
  });
