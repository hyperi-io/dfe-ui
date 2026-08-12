import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { oidcLoginPath } from './api';

export type TOidcLoginResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof oidcLoginPath, 'get'>
>;
