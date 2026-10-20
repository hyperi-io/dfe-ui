import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemDefaultsPath = API_CONFIG.system.defaults;

export const fetchSystemDefaultsApi = () => apiClient.get(systemDefaultsPath);
