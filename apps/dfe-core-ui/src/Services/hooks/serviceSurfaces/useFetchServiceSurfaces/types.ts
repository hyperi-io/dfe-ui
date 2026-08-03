import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceSurfacesPath } from './api';

export type TServiceSurfaceListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceSurfacesPath, 'get'>
>;
export type TServiceSurfaceSummaryItem = TServiceSurfaceListResponse[number];
