import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governancePolicyPath } from './api';

export type TCreateGovernancePolicyRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof governancePolicyPath, 'post'>
>;

export type TCreateGovernancePolicyResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governancePolicyPath, 'post'>
>;
