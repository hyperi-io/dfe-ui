import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const backingServiceVarPath = API_CONFIG.backingServices.overlayVar;

export const updateBackingServiceVarApi = (
  options: DfeClientRequestOptions<typeof backingServiceVarPath, 'put'>,
) => apiClient.put(backingServiceVarPath, options);
