import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const repositoryObjectPath = API_CONFIG.repository.object;

export const deleteRepositoryObjectApi = (
  options: DfeClientRequestOptions<typeof repositoryObjectPath, 'delete'>,
) => apiClient.delete(repositoryObjectPath, options);
