import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { authMePath } from './api';

export type TAuthMeResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof authMePath, 'get'>
>;
