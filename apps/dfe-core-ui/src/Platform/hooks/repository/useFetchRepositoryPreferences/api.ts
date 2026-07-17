import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryPreferencesPath = API_CONFIG.repository.preferences;

export const fetchRepositoryPreferencesApi = () =>
  apiClient.get(repositoryPreferencesPath);
