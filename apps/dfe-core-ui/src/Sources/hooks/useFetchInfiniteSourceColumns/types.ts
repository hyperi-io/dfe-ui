import { components } from '@repo/dfe-engine-types';

export type UseFetchInfiniteSourceColumnsItem =
  components['schemas']['SourceSchemaColumnsResponse']['items'][number];

export type UseFetchInfiniteSourceColumnsResponse =
  components['schemas']['SourceSchemaColumnsResponse'];

export interface UseFetchInfiniteSourceColumnsProps {
  source_name?: string;
  version?: string;
  per_page?: number;
}
