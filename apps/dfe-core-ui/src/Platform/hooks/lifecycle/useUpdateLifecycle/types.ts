import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { lifecyclePath } from './api';

export type TLifecycleRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof lifecyclePath, 'post'>
>;

export type TUpdateLifecycleResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof lifecyclePath, 'post'>
>;
