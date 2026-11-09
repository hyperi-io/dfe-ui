import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appMetricsTotalsPath } from './api';

export type TAppTotalsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appMetricsTotalsPath, 'get'>
>;
