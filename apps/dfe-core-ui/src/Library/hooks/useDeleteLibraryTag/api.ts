import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteLibraryTagPath = API_CONFIG.library.tag;

export const deleteLibraryTagApi = (
  options: DfeClientRequestOptions<typeof deleteLibraryTagPath, 'delete'>,
) => apiClient.delete(deleteLibraryTagPath, options);
