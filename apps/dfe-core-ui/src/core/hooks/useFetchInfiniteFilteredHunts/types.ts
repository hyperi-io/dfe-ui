import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredHuntsPath } from './api';

export type THuntListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredHuntsPath, 'get'>
>;
export type THuntListItem = THuntListResponse['items'][number];

export type HuntSortBy =
  | 'name'
  | 'display_name'
  | 'source_table'
  | 'target_table';

export type UseFetchInfiniteFilteredHuntsProps = {
  search?: string;
  sort_by?: HuntSortBy;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
};
