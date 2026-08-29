import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryTagPath = API_CONFIG.library.tag;

export const setLibraryTagApi = (
  options: DfeClientRequestOptions<typeof libraryTagPath, 'put'>,
) => apiClient.put(libraryTagPath, options);
