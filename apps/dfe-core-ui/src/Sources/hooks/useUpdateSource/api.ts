import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateSourcePath = API_CONFIG.sources.source;
export const updateSource = (
  options: DfeClientRequestOptions<typeof updateSourcePath, 'put'>,
) => apiClient.put(updateSourcePath, options);
