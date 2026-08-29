import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createLibraryArtifactPath = API_CONFIG.library.default;

export const createLibraryArtifactApi = (
  options: DfeClientRequestOptions<typeof createLibraryArtifactPath, 'post'>,
) => apiClient.post(createLibraryArtifactPath, options);
