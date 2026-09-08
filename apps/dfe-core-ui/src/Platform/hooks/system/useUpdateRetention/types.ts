import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateSystemRetentionPath } from './api';

export type TUpdateSystemRetentionRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateSystemRetentionPath, 'put'>
>;

export type TUpdateSystemRetentionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateSystemRetentionPath, 'put'>
>;
