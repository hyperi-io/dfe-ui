import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const lifecyclePath = API_CONFIG.lifecycle.default;

export const fetchLifecycleApi = () => apiClient.get(lifecyclePath);
