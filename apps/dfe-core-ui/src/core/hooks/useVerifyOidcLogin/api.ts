import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const verifyOidcLoginPath = API_CONFIG.oidcProviders.verifyLogin;

export const verifyOidcLogin = (
  options: DfeClientRequestOptions<typeof verifyOidcLoginPath, 'get'>,
) => apiClient.get(verifyOidcLoginPath, options);
