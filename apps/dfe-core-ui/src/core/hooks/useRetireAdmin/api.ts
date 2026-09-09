import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const retireAdminPath = API_CONFIG.auth.retireAdmin;

// No body: the engine retires the account its own settings name.
export const retireAdmin = () => apiClient.post(retireAdminPath);
