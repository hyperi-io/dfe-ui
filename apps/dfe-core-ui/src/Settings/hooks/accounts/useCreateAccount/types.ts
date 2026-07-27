import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createAccountPath } from './api';

export type TAccountCreateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createAccountPath, 'post'>
>;
export type TAccountCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createAccountPath, 'post'>
>;
