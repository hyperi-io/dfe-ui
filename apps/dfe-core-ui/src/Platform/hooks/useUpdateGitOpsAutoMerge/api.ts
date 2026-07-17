import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';

export const gitOpsAutoMergePath = '/api/v1/gitops/auto-merge';

export const gitOpsAutoMergeApi = (
  options: DfeClientRequestOptions<typeof gitOpsAutoMergePath, 'put'>,
) => apiClient.put(gitOpsAutoMergePath, options);
