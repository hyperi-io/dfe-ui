import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const oidcCallbackPath = API_CONFIG.oidc.callback;

export const oidcCallback = (
  options?: DfeClientRequestOptions<typeof oidcCallbackPath, 'get'>,
) => apiClient.get(oidcCallbackPath, options);
