import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governanceActionDetailPath } from './api';

export type TGovernanceActionDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governanceActionDetailPath, 'get'>
>;
