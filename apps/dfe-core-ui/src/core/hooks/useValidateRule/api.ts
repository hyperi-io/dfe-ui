import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const validateRulePath = API_CONFIG.rules.validate;

export const validateRule = (
  options: DfeClientRequestOptions<typeof validateRulePath, 'post'>,
) => apiClient.post(validateRulePath, options);
