import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

export const systemDefaultsPath = API_CONFIG.system.defaults;
export const SYSTEM_DEFAULTS_QUERY_KEY = QUERY_KEYS.system.defaults;

export const fetchSystemDefaultsApi = () => apiClient.get(systemDefaultsPath);
