import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryPreferencesPath = API_CONFIG.repository.preferences;

export const updateRepositoryPreferencesApi = (
  options: DfeClientRequestOptions<typeof repositoryPreferencesPath, 'patch'>,
) => apiClient.patch(repositoryPreferencesPath, options);
