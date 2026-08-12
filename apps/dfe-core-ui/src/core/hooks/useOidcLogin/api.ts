import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const oidcLoginPath = API_CONFIG.oidc.login;

export const oidcLogin = (
  options?: DfeClientRequestOptions<typeof oidcLoginPath, 'get'>,
) => apiClient.get(oidcLoginPath, options);
