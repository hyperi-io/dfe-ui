import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { TSystemVersionResponse } from './types';

export const systemVersionPath = API_CONFIG.system.version;

export const fetchSystemVersionApi = (): Promise<TSystemVersionResponse> =>
  apiClient.get(systemVersionPath);
