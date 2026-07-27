import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createGroupPath } from './api';

export type TGroupCreateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createGroupPath, 'post'>
>;
export type TGroupCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createGroupPath, 'post'>
>;
