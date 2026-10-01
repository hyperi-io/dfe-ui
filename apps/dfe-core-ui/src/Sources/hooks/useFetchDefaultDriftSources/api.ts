import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const defaultsDriftPath = API_CONFIG.system.defaultsDrift;
export const fetchDefaultDriftSources = ({
  ...options
}: DfeClientRequestOptions<typeof defaultsDriftPath, 'get'> = {}) =>
  apiClient.get(defaultsDriftPath, options);
