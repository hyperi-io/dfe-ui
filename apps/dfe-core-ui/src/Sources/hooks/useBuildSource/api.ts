import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const buildSourcePath = API_CONFIG.sources.sourceBuild;

export const buildSource = (
  options: DfeClientRequestOptions<typeof buildSourcePath, 'post'>,
) => apiClient.post(buildSourcePath, options);
