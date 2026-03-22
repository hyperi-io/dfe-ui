import { components } from '@dfe/dfe-engine-types';

export type SourceListResponse =
  components['schemas']['PaginatedResponse_SourceSummary_'];
export type SourceSummary = components['schemas']['SourceSummary'];
export interface SourceListRequestParams {
  search?: string;
  enabled?: 'true' | 'false';
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredSourcesProps = Omit<
  SourceListRequestParams,
  'page'
>;
