import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { governanceChRbacReconcilePath } from './api';

export type TReconcileGovernanceChRbacResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof governanceChRbacReconcilePath, 'post'>
>;
