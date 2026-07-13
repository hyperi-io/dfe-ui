import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateAlertPath } from './api';

export type TAlertUpdateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateAlertPath, 'put'>
>;

export type TAlertUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAlertPath, 'put'>
>;
