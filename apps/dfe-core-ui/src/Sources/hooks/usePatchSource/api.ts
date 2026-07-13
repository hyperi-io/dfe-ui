import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourcePath = API_CONFIG.sources.source;
export const patchSource = (
  options: DfeClientRequestOptions<typeof sourcePath, 'patch'>,
) => apiClient.patch(sourcePath, options);
