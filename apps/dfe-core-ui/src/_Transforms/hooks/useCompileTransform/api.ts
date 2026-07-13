import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { TCompileTransformRequest } from './types';

export const compileTransformPath = API_CONFIG.transforms.compile;

export const compileTransform = (body: TCompileTransformRequest) =>
  apiClient.post(compileTransformPath, { body });
