import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchApiKeysPath = API_CONFIG.apiKeys.default;

export const fetchApiKeys = (
  options?: DfeClientRequestOptions<typeof fetchApiKeysPath, 'get'>,
) => apiClient.get(fetchApiKeysPath, options);
