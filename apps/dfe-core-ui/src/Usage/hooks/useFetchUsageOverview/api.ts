import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const usageOverviewPath = API_CONFIG.usage.overview;

export const fetchUsageOverview = () => apiClient.get(usageOverviewPath);
