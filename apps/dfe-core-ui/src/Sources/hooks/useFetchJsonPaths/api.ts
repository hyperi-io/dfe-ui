import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const jsonPathsPath = API_CONFIG.schemas.jsonPaths;

export const jsonPaths = (
  options: DfeClientRequestOptions<typeof jsonPathsPath, 'get'>,
) => apiClient.get(jsonPathsPath, options);
