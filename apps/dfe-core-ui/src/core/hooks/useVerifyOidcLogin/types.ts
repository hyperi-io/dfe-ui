import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { verifyOidcLoginPath } from './api';

export type TVerifyOidcLoginResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof verifyOidcLoginPath, 'get'>
>;
