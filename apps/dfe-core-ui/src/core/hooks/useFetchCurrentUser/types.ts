import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchCurrentUserPath } from './api';

export type TCurrentUserResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchCurrentUserPath, 'get'>
>;
