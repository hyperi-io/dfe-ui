import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const updateSchemaPath = API_CONFIG.schemas.schema;

export const updateSchema = (
  options: DfeClientRequestOptions<typeof updateSchemaPath, 'patch'>,
) => apiClient.patch(updateSchemaPath, options);
