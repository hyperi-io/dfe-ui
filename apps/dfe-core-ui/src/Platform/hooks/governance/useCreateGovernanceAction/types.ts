import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governanceActionPath } from './api';

export type TCreateGovernanceActionRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof governanceActionPath, 'post'>
>;

export type TCreateGovernanceActionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governanceActionPath, 'post'>
>;
