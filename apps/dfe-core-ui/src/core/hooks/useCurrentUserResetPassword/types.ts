import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { resetCurrentUserPasswordPath } from './api';

export type TCurrentUserResetPasswordRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof resetCurrentUserPasswordPath, 'post'>
>;
export type TCurrentUserResetPasswordResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof resetCurrentUserPasswordPath, 'post'>
>;
