export interface UseFetchInfiniteFilteredSchemasProps {
  search?: string;
  path_prefix?: string;
  sort_by?: 'path' | 'current_version' | 'column_count';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}
