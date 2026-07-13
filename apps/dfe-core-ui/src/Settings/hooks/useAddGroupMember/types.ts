import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { addGroupMemberPath } from './api';

export type TAddGroupMemberRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof addGroupMemberPath, 'post'>
>;
export type TAddGroupMemberResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof addGroupMemberPath, 'post'>
>;
