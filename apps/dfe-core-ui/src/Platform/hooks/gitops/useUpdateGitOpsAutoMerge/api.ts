import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const gitOpsAutoMergePath = API_CONFIG.gitops.autoMerge;

export const gitOpsAutoMergeApi = (
  options: DfeClientRequestOptions<typeof gitOpsAutoMergePath, 'put'>,
) => apiClient.put(gitOpsAutoMergePath, options);
