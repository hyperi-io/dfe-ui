import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFileLinksPath = API_CONFIG.apps.fileLinks;

export const fetchAppFileLinksApi = (
  options: DfeClientRequestOptions<typeof appFileLinksPath, 'get'>,
) => apiClient.get(appFileLinksPath, options);
