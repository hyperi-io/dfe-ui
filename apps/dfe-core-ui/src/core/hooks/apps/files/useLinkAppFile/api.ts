import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFileLinkPath = API_CONFIG.apps.fileLink;

export const linkAppFileApi = (
  options: DfeClientRequestOptions<typeof appFileLinkPath, 'post'>,
) => apiClient.post(appFileLinkPath, options);
