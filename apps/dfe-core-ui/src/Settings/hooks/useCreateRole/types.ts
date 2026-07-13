import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createRolePath } from './api';

export type TRoleCreateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createRolePath, 'post'>
>;
export type TRoleCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createRolePath, 'post'>
>;
