import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const applyDefaultsPath = API_CONFIG.system.applyDefaults;

export const applyDefaults = (
  options: DfeClientRequestOptions<typeof applyDefaultsPath, 'post'>,
) => apiClient.post(applyDefaultsPath, options);
