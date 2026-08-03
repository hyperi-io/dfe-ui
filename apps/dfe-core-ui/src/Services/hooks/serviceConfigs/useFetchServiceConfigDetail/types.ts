import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceConfigDetailPath } from './api';

export type TFetchServiceConfigDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceConfigDetailPath, 'get'>
>;
