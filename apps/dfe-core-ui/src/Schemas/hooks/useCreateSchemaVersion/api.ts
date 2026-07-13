import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createSchemaVersionPath = API_CONFIG.schemas.schemaVersions;

export const createSchemaVersion = (
  options: DfeClientRequestOptions<typeof createSchemaVersionPath, 'post'>,
) => apiClient.post(createSchemaVersionPath, options);
