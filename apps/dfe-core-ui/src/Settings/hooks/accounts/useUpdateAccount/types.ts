import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateAccountPath } from './api';

export type TAccountUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateAccountPath, 'put'>
>;
export type TAccountUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAccountPath, 'put'>
>;
