import { apiClient } from '@/core/config/api';

export const gitOpsAutoMergePath = '/api/v1/gitops/auto-merge';

export const gitOpsAutoMergeApi = () => apiClient.get(gitOpsAutoMergePath);
