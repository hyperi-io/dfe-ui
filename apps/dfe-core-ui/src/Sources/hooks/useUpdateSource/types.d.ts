import { components } from '@repo/dfe-engine-types';

// TODO: [TypeSafety] pull this from the engine types - BE work required
export type SourceUpdateRequestBody = {
  source: string;
  display_name?: string;
  description?: string;
  enabled?: boolean;
  header?: {
    type?: string;
    version?: string;
  } | null;
  match?: {
    field?: string;
    value?: string;
  } | null;
  schema?: {
    meta_schema?: string;
    meta_schema_version?: string;
    derived_schema?: string;
    additional_fields?: string[];
    ttl_days?: number;
    engine?: string;
  } | null;
  fetcher?: {
    source_type?: string;
    base_url?: string;
    auth?: {
      type?: string;
      token_url?: string;
      client_id?: string;
      client_secret?: string;
      api_key?: string;
    } | null;
    poll_interval_secs?: number;
  } | null;
  mapping_standards?: string[];
};

export type SourceUpdateResponse = components['schemas']['SourceResponse'];
