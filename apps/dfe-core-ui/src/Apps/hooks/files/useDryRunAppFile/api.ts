import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const appFileDryRunPath = API_CONFIG.apps.fileDryRun;

export const dryRunAppFileApi = (
  options: DfeClientRequestOptions<typeof appFileDryRunPath, 'post'>,
) => apiClient.post(appFileDryRunPath, options);
