import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const setYourOrganisationPath = API_CONFIG.system.organisation;

export const setYourOrganisation = (
  options: DfeClientRequestOptions<typeof setYourOrganisationPath, 'put'>,
) => apiClient.put(setYourOrganisationPath, options);
