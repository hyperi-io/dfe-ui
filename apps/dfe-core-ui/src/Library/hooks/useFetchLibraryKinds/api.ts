import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryKindsPath = API_CONFIG.library.kinds;

export const fetchLibraryKindsApi = (
  options?: DfeClientRequestOptions<typeof libraryKindsPath, 'get'>,
) => apiClient.get(libraryKindsPath, options);
