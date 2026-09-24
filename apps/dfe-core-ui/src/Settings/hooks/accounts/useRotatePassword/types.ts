import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { rotatePasswordPath } from './api';

export type TRotatePasswordRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof rotatePasswordPath, 'post'>
>;
export type TRotatePasswordResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof rotatePasswordPath, 'post'>
>;
