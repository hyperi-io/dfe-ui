import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchOrganisationsPath = API_CONFIG.orgs.default;

export const fetchOrganisations = (
  options?: DfeClientRequestOptions<typeof fetchOrganisationsPath, 'get'>,
) => apiClient.get(fetchOrganisationsPath, options);
