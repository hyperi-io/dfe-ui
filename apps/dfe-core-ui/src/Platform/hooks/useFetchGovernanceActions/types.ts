import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governanceActionsPath } from './api';

export type TGovernanceActionsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governanceActionsPath, 'get'>
>;
