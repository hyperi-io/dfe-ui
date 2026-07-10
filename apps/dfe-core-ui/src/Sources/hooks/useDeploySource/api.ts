import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deploySourcePath = API_CONFIG.sources.deploy;

export const deploySource = (
  options: DfeClientRequestOptions<typeof deploySourcePath, 'post'>,
) => apiClient.post(deploySourcePath, options);
