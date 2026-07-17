import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryObjectDetailPath = API_CONFIG.repository.object;

export const fetchRepositoryObjectDetailApi = (
  options: DfeClientRequestOptions<typeof repositoryObjectDetailPath, 'get'>,
) => apiClient.get(repositoryObjectDetailPath, options);
