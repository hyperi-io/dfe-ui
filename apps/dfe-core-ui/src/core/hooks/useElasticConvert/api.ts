import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const elasticConvertPath = API_CONFIG.schemas.elasticConvert;
export const elasticConvert = (
  options: DfeClientRequestOptions<typeof elasticConvertPath, 'post'>,
) => apiClient.post(elasticConvertPath, options);
