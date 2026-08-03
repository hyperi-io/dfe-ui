import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { refreshServiceSurfaceMetricsPath } from './api';

export type TRefreshServiceSurfaceMetricsResponse =
  DfeClientSuccessResponseBody<
    DfeClientOperationFor<typeof refreshServiceSurfaceMetricsPath, 'post'>
  >;
