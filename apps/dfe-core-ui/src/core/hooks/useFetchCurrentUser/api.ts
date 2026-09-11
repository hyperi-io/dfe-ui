import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchCurrentUserPath = API_CONFIG.accounts.me;
export const fetchCurrentUser = () => apiClient.get(fetchCurrentUserPath);
