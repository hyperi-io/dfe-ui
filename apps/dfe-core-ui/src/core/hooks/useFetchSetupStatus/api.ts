import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchSetupStatusPath = API_CONFIG.auth.setupStatus;

export const fetchSetupStatus = () => apiClient.get(fetchSetupStatusPath);
