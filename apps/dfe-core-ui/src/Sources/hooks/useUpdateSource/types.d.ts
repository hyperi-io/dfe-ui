import { components } from '@dfe/dfe-engine-types';

export type SourceUpdateRequestBody = {
  source: string;
  display_name: string;
  description?: string | null;
  enabled?: boolean;
  header_type?: string | null;
  has_transform?: boolean;
  has_fetcher?: boolean;
  mapping_standards?: string[];
};

export type SourceUpdateResponse = components['schemas']['SourceResponse'];
