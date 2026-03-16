import { components } from '@dfe/dfe-engine-types';

export type SourceDetail = components['schemas']['SourceResponse'] & {
  source: string;
};
