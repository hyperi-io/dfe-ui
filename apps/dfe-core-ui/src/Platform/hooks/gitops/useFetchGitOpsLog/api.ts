import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const gitOpsLogPath = API_CONFIG.gitops.log;

export const gitOpsLogApi = (
  options?: DfeClientRequestOptions<typeof gitOpsLogPath, 'get'>,
) => apiClient.get(gitOpsLogPath, options);
