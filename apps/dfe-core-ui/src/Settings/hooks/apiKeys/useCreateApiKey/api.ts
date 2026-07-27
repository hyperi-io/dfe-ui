import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createApiKeyPath = API_CONFIG.apiKeys.default;

export const createApiKey = (
  options: DfeClientRequestOptions<typeof createApiKeyPath, 'post'>,
) => apiClient.post(createApiKeyPath, options);
