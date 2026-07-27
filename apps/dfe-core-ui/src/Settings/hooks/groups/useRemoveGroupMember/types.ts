import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { removeGroupMemberPath } from './api';

export type TRemoveGroupMemberResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof removeGroupMemberPath, 'delete'>
>;
