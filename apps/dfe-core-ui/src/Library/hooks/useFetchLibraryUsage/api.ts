import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryUsagePath = API_CONFIG.library.usage;

export const fetchLibraryUsageApi = (
  options: DfeClientRequestOptions<typeof libraryUsagePath, 'get'>,
) => apiClient.get(libraryUsagePath, options);
