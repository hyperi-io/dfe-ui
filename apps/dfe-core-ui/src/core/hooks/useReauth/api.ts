import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const reauthPath = API_CONFIG.auth.reauth;

export const oidcReauthPath = API_CONFIG.oidc.reauth;

export const oidcReauth = (
  options: DfeClientRequestOptions<typeof oidcReauthPath, 'post'>,
) => apiClient.post(oidcReauthPath, options);

export const reauth = (
  options: DfeClientRequestOptions<typeof reauthPath, 'post'>,
) => apiClient.post(reauthPath, options);
