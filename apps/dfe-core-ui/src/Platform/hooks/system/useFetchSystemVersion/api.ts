import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemVersionPath = API_CONFIG.system.version;

export const fetchSystemVersionApi = () => apiClient.get(systemVersionPath);
