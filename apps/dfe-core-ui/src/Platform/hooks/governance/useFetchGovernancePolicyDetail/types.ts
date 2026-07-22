import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governancePolicyDetailPath } from './api';

export type TGovernancePolicyDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governancePolicyDetailPath, 'get'>
>;
