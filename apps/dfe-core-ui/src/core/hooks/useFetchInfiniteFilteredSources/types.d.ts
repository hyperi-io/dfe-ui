import { components } from '@repo/dfe-engine-types';

export type SourceListResponse =
  components['schemas']['PaginatedSourceSummaryResponse'];
export type SourceSummary = components['schemas']['SourceSummaryObject'];
export type SourceListSummary = SourceListResponse['items'][number];
export interface SourceListRequestParams {
  search?: string;
  enabled?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredSourcesProps = Omit<
  SourceListRequestParams,
  'page'
>;
