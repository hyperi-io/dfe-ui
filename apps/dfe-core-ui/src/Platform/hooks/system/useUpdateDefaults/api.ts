import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemDefaultsPath = API_CONFIG.system.defaults;

export const updateSystemDefaultsApi = (
  options: DfeClientRequestOptions<typeof systemDefaultsPath, 'patch'>,
) => apiClient.patch(systemDefaultsPath, options);
