import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const clientConfigPath = API_CONFIG.clientConfig.default;

export const fetchClientConfigApi = () => apiClient.get(clientConfigPath);
