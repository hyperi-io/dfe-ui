import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceSurfaceDetailPath = API_CONFIG.serviceSurfaces.surface;

export const fetchServiceSurfaceDetail = (
  options: DfeClientRequestOptions<typeof fetchServiceSurfaceDetailPath, 'get'>,
) => apiClient.get(fetchServiceSurfaceDetailPath, options);
