import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateGroupPath } from './api';

export type TGroupUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateGroupPath, 'put'>
>;
export type TGroupUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateGroupPath, 'put'>
>;
