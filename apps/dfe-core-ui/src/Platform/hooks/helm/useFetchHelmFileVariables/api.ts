import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const helmFileVariablesPath = API_CONFIG.helm.fileVariables;

export const fetchHelmFileVariablesApi = (
  options: DfeClientRequestOptions<typeof helmFileVariablesPath, 'get'>,
) => apiClient.get(helmFileVariablesPath, options);
