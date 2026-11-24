import {
  DfeClientOperationFor,
  DfeClientRequestOptions,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredHuntsPath } from './api';

export type THuntListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredHuntsPath, 'get'>
>;
export type THuntListItem = THuntListResponse['items'][number];

export type HuntSortBy =
  'name' | 'display_name' | 'source_table' | 'target_table';

export type THuntListQueryParams = NonNullable<
  DfeClientRequestOptions<
    typeof fetchInfiniteFilteredHuntsPath,
    'get'
  >['queryParams']
>;

export type UseFetchInfiniteFilteredHuntsProps = Omit<
  THuntListQueryParams,
  'order_by' | 'page_token' | 'page_size'
> & {
  sort_by?: HuntSortBy;
  sort_order?: 'asc' | 'desc';
  page_size?: number;
  queryEnabled?: boolean;
};
