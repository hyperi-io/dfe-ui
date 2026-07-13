import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { TTestTransformRequest } from './types';

export const testTransformPath = API_CONFIG.transforms.test;

export const testTransform = (body: TTestTransformRequest) =>
  apiClient.post(testTransformPath, { body });
