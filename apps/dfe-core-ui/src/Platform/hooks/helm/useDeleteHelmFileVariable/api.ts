import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const helmFileVariablePath = API_CONFIG.helm.fileVariable;

export const deleteHelmFileVariableApi = (
  options: DfeClientRequestOptions<typeof helmFileVariablePath, 'delete'>,
) => apiClient.delete(helmFileVariablePath, options);
