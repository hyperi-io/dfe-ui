import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteSchemaVersionPath = API_CONFIG.schemas.schemaVersionsVersion;

export const deleteSchemaVersion = (
  options: DfeClientRequestOptions<typeof deleteSchemaVersionPath, 'delete'>,
) => apiClient.delete(deleteSchemaVersionPath, options);
