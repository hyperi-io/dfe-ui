import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchServiceSurfacesPath = API_CONFIG.serviceSurfaces.default;

export const fetchServiceSurfaces = (
  options: DfeClientRequestOptions<typeof fetchServiceSurfacesPath, 'get'> = {},
) => apiClient.get(fetchServiceSurfacesPath, options);
