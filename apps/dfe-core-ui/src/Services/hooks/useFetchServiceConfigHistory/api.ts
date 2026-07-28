import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceConfigHistoryPath = API_CONFIG.serviceConfigs.history;

export const fetchServiceConfigHistory = (service: string, instance: string) =>
  apiClient.get(fetchServiceConfigHistoryPath, {
    pathParams: {
      service,
      instance,
    },
  });
