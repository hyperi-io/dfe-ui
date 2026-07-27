import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const revokeApiKeyPath = API_CONFIG.apiKeys.apiKey;

export const revokeApiKey = (
  options: DfeClientRequestOptions<typeof revokeApiKeyPath, 'delete'>,
) => apiClient.delete(revokeApiKeyPath, options);
