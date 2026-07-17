import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { gitOpsAutoMergePath } from './api';

export type TGitOpsAutoMergeRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof gitOpsAutoMergePath, 'put'>
>;

export type TGitOpsAutoMergeResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof gitOpsAutoMergePath, 'put'>
>;
