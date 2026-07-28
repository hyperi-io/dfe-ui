import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const validateServiceConfigPath = API_CONFIG.serviceConfigs.validate;

export const validateServiceConfig = (
  options: DfeClientRequestOptions<typeof validateServiceConfigPath, 'post'>,
) => apiClient.post(validateServiceConfigPath, options);
