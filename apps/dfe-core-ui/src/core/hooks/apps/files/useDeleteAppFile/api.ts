import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteAppFilePath = API_CONFIG.apps.file;

export const deleteAppFileApi = (
  options: DfeClientRequestOptions<typeof deleteAppFilePath, 'delete'>,
) => apiClient.delete(deleteAppFilePath, options);
