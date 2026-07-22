import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemClickhouseStatusPath = API_CONFIG.system.clickhouseCloud;

export const fetchSystemClickhouseStatusApi = () =>
  apiClient.get(systemClickhouseStatusPath);
