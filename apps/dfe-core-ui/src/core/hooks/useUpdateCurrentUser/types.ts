import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateCurrentUserPath } from './api';

export type TCurrentUserUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateCurrentUserPath, 'put'>
>;
export type TCurrentUserUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateCurrentUserPath, 'put'>
>;
