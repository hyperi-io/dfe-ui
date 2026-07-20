import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governancePoliciesPath = API_CONFIG.governance.policies;

export const governancePoliciesApi = () =>
  apiClient.get(governancePoliciesPath);
