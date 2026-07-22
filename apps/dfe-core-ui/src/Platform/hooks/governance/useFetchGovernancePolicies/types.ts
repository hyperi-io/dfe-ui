import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governancePoliciesPath } from './api';

export type TGovernancePoliciesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governancePoliciesPath, 'get'>
>;
