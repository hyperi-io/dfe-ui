import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const patchLibraryArtifactPath = API_CONFIG.library.artifact;

export const patchLibraryArtifactApi = (
  options: DfeClientRequestOptions<typeof patchLibraryArtifactPath, 'patch'>,
) => apiClient.patch(patchLibraryArtifactPath, options);
