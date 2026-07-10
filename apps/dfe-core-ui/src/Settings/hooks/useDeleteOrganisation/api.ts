import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteOrganisationPath = API_CONFIG.orgs.org;

export const deleteOrganisation = (
  options: DfeClientRequestOptions<typeof deleteOrganisationPath, 'delete'>,
) => apiClient.delete(deleteOrganisationPath, options);
