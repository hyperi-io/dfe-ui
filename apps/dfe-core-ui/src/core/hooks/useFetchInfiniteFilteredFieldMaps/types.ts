import { components } from '@repo/dfe-engine-types';

export type FieldMapListResponse =
  components['schemas']['PaginatedResponse_FieldMapSummary_'];
export type FieldMapSummary = components['schemas']['FieldMapSummary'];
export interface FieldMapListRequestParams {
  search?: string;
  standard?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredFieldMapsProps = Omit<
  FieldMapListRequestParams,
  'page'
>;
