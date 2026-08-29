import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteLibraryArtifactPath = API_CONFIG.library.artifact;

export const deleteLibraryArtifactApi = (
  options: DfeClientRequestOptions<typeof deleteLibraryArtifactPath, 'delete'>,
) => apiClient.delete(deleteLibraryArtifactPath, options);
