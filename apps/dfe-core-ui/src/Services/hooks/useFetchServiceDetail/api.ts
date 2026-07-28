import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceDetailPath = API_CONFIG.services.instance;

export const fetchServiceDetail = (service: string, instance: string) =>
  apiClient.get(fetchServiceDetailPath, {
    pathParams: {
      service,
      instance,
    },
  });
