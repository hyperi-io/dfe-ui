import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const adminLinksPath = API_CONFIG.deployment.adminLinks;

export const fetchAdminLinksApi = (
  options?: DfeClientRequestOptions<typeof adminLinksPath, 'get'>,
) => apiClient.get(adminLinksPath, options);
