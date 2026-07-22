import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governanceActionInvokePath } from './api';

export type TGovernanceActionInvokeResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governanceActionInvokePath, 'post'>
>;
