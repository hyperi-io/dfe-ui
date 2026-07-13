import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createSourcePath = API_CONFIG.sources.default;

export const createSource = (
  options: DfeClientRequestOptions<typeof createSourcePath, 'post'>,
) => apiClient.post(createSourcePath, options);
