import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryVersionsPath = API_CONFIG.library.versions;

export const fetchLibraryVersionsApi = (
  options: DfeClientRequestOptions<typeof libraryVersionsPath, 'get'>,
) => apiClient.get(libraryVersionsPath, options);
