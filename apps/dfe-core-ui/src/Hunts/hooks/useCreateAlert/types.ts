import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createAlertPath } from './api';

export type TAlertCreateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createAlertPath, 'post'>
>;

export type TAlertCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createAlertPath, 'post'>
>;
