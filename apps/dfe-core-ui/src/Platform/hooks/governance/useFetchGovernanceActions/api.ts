import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceActionsPath = API_CONFIG.governance.actions;

export const governanceActionsApi = () => apiClient.get(governanceActionsPath);
