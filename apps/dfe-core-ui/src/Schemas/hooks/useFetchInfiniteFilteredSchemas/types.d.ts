import { components } from '@repo/dfe-engine-types';

export interface UseFetchInfiniteFilteredSchemasProps {
  search?: string;
  path_prefix?: string;
  sort_by?: 'path' | 'current_version' | 'column_count';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export type SchemaListResponse =
  components['schemas']['PaginatedResponse_MetaSchemaListItem_'];
