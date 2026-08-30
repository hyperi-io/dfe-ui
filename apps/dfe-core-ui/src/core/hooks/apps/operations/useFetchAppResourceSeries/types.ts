import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appMetricsSeriesPath } from './api';

export type TAppResourceSeriesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appMetricsSeriesPath, 'get'>
>;

export type TAppResourceBucket = TAppResourceSeriesResponse['buckets'][number];
