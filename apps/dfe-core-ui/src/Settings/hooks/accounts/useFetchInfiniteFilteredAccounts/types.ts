import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchAccountsPath } from './api';

export type TAccountsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchAccountsPath, 'get'>
>;

export type TAccountsItemSummary = TAccountsResponse['items'][number];

export type TFetchAccountsQueryParams = {
  search?: string;
  oidc_id?: string;
  org?: string;
  blocked?: boolean;
  include_core?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'org';
  sort_order?: 'asc' | 'desc';
  page_size?: number;
};
export type useFetchInfiniteFilteredAccountsProps = TFetchAccountsQueryParams;
