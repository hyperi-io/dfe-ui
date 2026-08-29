import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryPath = API_CONFIG.library.default;

export const fetchLibraryArtifactsApi = (
  options?: DfeClientRequestOptions<typeof libraryPath, 'get'>,
) => apiClient.get(libraryPath, options);
