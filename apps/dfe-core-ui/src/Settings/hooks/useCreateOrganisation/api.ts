import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createOrganisationPath = API_CONFIG.orgs.default;

export const createOrganisation = (
  options: DfeClientRequestOptions<typeof createOrganisationPath, 'post'>,
) => apiClient.post(createOrganisationPath, options);
