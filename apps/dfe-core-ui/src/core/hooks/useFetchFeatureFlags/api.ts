import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const featureFlagsPath = API_CONFIG.clientConfig.features;

export const fetchFeatureFlagsApi = () => apiClient.get(featureFlagsPath);
