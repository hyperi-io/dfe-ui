import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemRetentionPath = API_CONFIG.system.retention;

export const fetchSystemRetentionApi = () => apiClient.get(systemRetentionPath);
