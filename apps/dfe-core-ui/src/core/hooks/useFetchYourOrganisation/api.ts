import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchYourOrganisationPath = API_CONFIG.system.organisation;

export const fetchYourOrganisation = (
  options: DfeClientRequestOptions<
    typeof fetchYourOrganisationPath,
    'get'
  > = {},
) => apiClient.get(fetchYourOrganisationPath, options);
