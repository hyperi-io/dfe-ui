import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const gitOpsAutoMergePath = API_CONFIG.gitops.autoMerge;

export const gitOpsAutoMergeApi = () => apiClient.get(gitOpsAutoMergePath);
