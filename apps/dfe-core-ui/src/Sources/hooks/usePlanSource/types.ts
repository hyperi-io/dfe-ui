import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { components } from '@repo/dfe-engine-types';
import { sourcePlanPath } from './api';

export type TSourcePlanResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourcePlanPath, 'post'>
> &
  components['schemas']['SourcePlanResponse'];
export interface SourcePlanRequest {
  name: string;
  version: string;
}
