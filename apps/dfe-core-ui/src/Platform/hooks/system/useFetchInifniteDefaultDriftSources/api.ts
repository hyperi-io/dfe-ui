import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const defaultsDriftSourcesPath = API_CONFIG.system.defaultsDrift;

export const defaultsDriftSources = (
  options: DfeClientRequestOptions<typeof defaultsDriftSourcesPath, 'get'>,
) => apiClient.get(defaultsDriftSourcesPath, options);
