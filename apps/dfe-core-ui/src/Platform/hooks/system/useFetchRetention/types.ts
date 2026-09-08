import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemRetentionPath } from './api';

export type TSystemRetentionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemRetentionPath, 'get'>
>;
