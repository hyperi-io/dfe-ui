import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const libraryRollbackPath = API_CONFIG.library.rollback;

export const rollbackLibraryArtifactApi = (
  options: DfeClientRequestOptions<typeof libraryRollbackPath, 'post'>,
) => apiClient.post(libraryRollbackPath, options);
