import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteSchemaPath = API_CONFIG.schemas.schema;

export const deleteSchema = (
  options: DfeClientRequestOptions<typeof deleteSchemaPath, 'delete'>,
) => apiClient.delete(deleteSchemaPath, options);
