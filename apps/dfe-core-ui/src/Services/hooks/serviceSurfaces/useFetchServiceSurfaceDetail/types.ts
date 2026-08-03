import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceSurfaceDetailPath } from './api';

export type TServiceSurfaceDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceSurfaceDetailPath, 'get'>
>;
