import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryArtifactPath = API_CONFIG.library.artifact;

export const fetchLibraryArtifactDetailApi = (
  options: DfeClientRequestOptions<typeof libraryArtifactPath, 'get'>,
) => apiClient.get(libraryArtifactPath, options);
