import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFileRelinkPath = API_CONFIG.apps.fileRelink;

export const relinkAppFilesApi = (
  options: DfeClientRequestOptions<typeof appFileRelinkPath, 'post'>,
) => apiClient.post(appFileRelinkPath, options);
