import { components } from '@repo/dfe-engine-types';

export type HuntListResponse =
  components['schemas']['PaginatedResponse_HuntSummary_'];
export type HuntListItem = HuntListResponse['items'][number];

export type HuntSortBy = 'hunt_id' | 'name' | 'source_table' | 'target_table';

export type UseFetchInfiniteFilteredHuntsProps = {
  search?: string;
  sort_by?: HuntSortBy;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
};
