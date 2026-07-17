import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { gitOpsAutoMergePath } from './api';

export type TGitOpsAutoMergeResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof gitOpsAutoMergePath, 'get'>
>;
