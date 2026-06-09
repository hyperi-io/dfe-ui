import { components } from '@repo/dfe-engine-types';

export type UseFetchInfiniteSourceColumnsItem =
  components['schemas']['PaginatedSourceColumnsResponse']['items'][number];

export type UseFetchInfiniteSourceColumnsResponse =
  components['schemas']['PaginatedSourceColumnsResponse'];

export interface UseFetchInfiniteSourceColumnsProps {
  source_name?: string;
  version?: string;
  per_page?: number;
}
