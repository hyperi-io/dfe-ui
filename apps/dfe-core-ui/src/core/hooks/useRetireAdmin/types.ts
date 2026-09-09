import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { retireAdminPath } from './api';

export type TRetireAdminResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof retireAdminPath, 'post'>
>;
