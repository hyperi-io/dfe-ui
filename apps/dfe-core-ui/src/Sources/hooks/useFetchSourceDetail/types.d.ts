import { components } from '@repo/dfe-engine-types';

export type SourceDetail = components['schemas']['SourceResponse'] & {
  source: string;
};
