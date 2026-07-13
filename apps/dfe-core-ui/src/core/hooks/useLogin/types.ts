import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { loginPath } from './api';

export type TLoginResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof loginPath, 'post'>
>;

export type TLoginRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof loginPath, 'post'>
>;
