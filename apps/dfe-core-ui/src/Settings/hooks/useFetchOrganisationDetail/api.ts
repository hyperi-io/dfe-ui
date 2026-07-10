import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchOrganisationDetailPath = API_CONFIG.orgs.org;

export const fetchOrganisationDetail = (
  options: DfeClientRequestOptions<typeof fetchOrganisationDetailPath, 'get'>,
) => apiClient.get(fetchOrganisationDetailPath, options);
