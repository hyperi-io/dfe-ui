import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchAlertDetailPath } from './api';

export type TAlertDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchAlertDetailPath, 'get'>
>;
