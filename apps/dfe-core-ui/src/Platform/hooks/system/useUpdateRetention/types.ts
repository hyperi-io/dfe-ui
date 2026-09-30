import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { retentionPath } from './api';

export type TUpdateRetentionRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof retentionPath, 'put'>
>;

export type TUpdateRetentionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof retentionPath, 'put'>
>;
