import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryStatePath = API_CONFIG.library.state;

export const setLibraryArtifactStateApi = (
  options: DfeClientRequestOptions<typeof libraryStatePath, 'put'>,
) => apiClient.put(libraryStatePath, options);
