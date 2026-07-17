import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { gitOpsLogPath } from './api';

export type TGitOpsLogResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof gitOpsLogPath, 'get'>
>;
