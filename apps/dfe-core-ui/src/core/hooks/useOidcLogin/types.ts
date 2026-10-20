import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { oidcLoginPath } from './api';

type _TOidcLoginResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof oidcLoginPath, 'get'>
>;
