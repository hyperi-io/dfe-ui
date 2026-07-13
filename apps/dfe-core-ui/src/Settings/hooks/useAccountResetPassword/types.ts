import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { resetPasswordPath } from './api';

export type TAccountResetPasswordRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof resetPasswordPath, 'post'>
>;
export type TAccountResetPasswordResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof resetPasswordPath, 'post'>
>;
