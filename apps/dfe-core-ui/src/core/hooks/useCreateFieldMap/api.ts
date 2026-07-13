import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { TCreateFieldMapRequest } from './types';

export const createFieldMapPath = API_CONFIG.fieldMaps.default;

export const createFieldMap = (body: TCreateFieldMapRequest) =>
  apiClient.post(createFieldMapPath, { body });
