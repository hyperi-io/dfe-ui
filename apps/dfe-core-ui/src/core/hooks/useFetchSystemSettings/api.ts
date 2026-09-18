import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemSettingsPath = API_CONFIG.system.settings;

export const fetchSystemSettingsApi = () => apiClient.get(systemSettingsPath);
