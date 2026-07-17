import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryObjectsPath = API_CONFIG.repository.objects;

export const fetchRepositoryObjectsApi = (
  options: DfeClientRequestOptions<typeof repositoryObjectsPath, 'get'>,
) => apiClient.get(repositoryObjectsPath, options);
