import { components } from '@repo/dfe-engine-types';

export type SourcePlanResponse = components['schemas']['SourcePlanResponse'];
export interface SourcePlanRequest {
  name: string;
  version: string;
}
