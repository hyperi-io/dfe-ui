import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const gitOpsLogPath = API_CONFIG.gitops.log;

export const gitOpsLogApi = () => apiClient.get(gitOpsLogPath);
