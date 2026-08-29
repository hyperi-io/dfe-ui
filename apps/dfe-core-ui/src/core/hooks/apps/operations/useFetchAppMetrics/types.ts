import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appMetricsPath } from './api';

export type TAppMetricsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appMetricsPath, 'get'>
>;
