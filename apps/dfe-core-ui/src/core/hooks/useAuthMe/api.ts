import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const authMePath = API_CONFIG.auth.me;
export const fetchAuthMe = () => apiClient.get(authMePath);
