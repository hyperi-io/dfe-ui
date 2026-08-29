import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryVersionPath = API_CONFIG.library.version;

export const fetchLibraryVersionDetailApi = (
  options: DfeClientRequestOptions<typeof libraryVersionPath, 'get'>,
) => apiClient.get(libraryVersionPath, options);
