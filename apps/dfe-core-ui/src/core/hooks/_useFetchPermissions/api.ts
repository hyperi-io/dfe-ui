import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchPermissionsPath = API_CONFIG.auth.permissions;

export const fetchPermissions = () => apiClient.get(fetchPermissionsPath);
