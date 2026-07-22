import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryObjectPath = API_CONFIG.repository.object;

export const updateRepositoryObjectApi = (
  options: DfeClientRequestOptions<typeof repositoryObjectPath, 'put'>,
) => apiClient.put(repositoryObjectPath, options);
