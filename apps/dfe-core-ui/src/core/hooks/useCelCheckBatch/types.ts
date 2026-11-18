import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { checkCelBatchPath } from './api';

export type TCheckCelBatchRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof checkCelBatchPath, 'post'>
>;
export type TCheckCelBatchResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof checkCelBatchPath, 'post'>
>;
