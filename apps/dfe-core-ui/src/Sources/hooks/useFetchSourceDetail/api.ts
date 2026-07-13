import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourceVersionPath = API_CONFIG.sources.sourceVersion;
export const sourceVersion = (
  options: DfeClientRequestOptions<typeof sourceVersionPath, 'get'>,
) => apiClient.get(sourceVersionPath, options);
