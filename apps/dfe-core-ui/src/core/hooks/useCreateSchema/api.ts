import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createSchemaPath = API_CONFIG.schemas.schema;

export const createSchema = (
  options: DfeClientRequestOptions<typeof createSchemaPath, 'post'>,
) => apiClient.post(createSchemaPath, options);
