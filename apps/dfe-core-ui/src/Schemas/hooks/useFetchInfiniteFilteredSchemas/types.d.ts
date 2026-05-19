import { components } from '@repo/dfe-engine-types';

export interface UseFetchInfiniteFilteredSchemasProps {
  search?: string;
  sort_by?: 'path' | 'description';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export type SchemaListResponse =
  components['schemas']['PaginatedSchemaSummaryResponse'];

export type SchemaSummary = components['schemas']['SchemaSummary'];
