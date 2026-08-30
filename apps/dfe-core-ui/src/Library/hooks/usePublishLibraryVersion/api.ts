import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const publishLibraryVersionPath = API_CONFIG.library.versions;

export const publishLibraryVersionApi = (
  options: DfeClientRequestOptions<typeof publishLibraryVersionPath, 'post'>,
) => apiClient.post(publishLibraryVersionPath, options);
