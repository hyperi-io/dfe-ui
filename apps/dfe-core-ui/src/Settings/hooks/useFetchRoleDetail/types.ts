import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchRoleDetailPath } from './api';

export type TRoleDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchRoleDetailPath, 'get'>
>;
