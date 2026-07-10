import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const promoteFieldsPath = API_CONFIG.schemas.promoteField;
export const promoteFields = (
  options: DfeClientRequestOptions<typeof promoteFieldsPath, 'post'>,
) => apiClient.post(promoteFieldsPath, options);
