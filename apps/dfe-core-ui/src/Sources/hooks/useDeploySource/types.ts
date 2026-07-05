import { components } from '@repo/dfe-engine-types';

export type SourceDeployResponse =
  components['schemas']['SourceDeployResponse'];
export interface SourceDeployRequest {
  name: string;
  version: string;
}
