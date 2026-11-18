import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const checkCelPath = API_CONFIG.cel.check;

export const checkCel = (
  options: DfeClientRequestOptions<typeof checkCelPath, 'post'>,
) => apiClient.post(checkCelPath, options);
