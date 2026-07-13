import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceDetailPath } from './api';

export type TFetchServiceDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceDetailPath, 'get'>
>;
