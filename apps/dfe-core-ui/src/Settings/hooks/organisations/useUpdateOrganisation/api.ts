import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateOrganisationPath = API_CONFIG.orgs.org;

export const updateOrganisation = (
  options: DfeClientRequestOptions<typeof updateOrganisationPath, 'put'>,
) => apiClient.put(updateOrganisationPath, options);
