import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sourcePlanPath } from './api';

export type TSourcePlanResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourcePlanPath, 'post'>
>;
export interface SourcePlanRequest {
  name: string;
  version: string;
}
