import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchAccountsPath } from './api';

export type TAccountsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchAccountsPath, 'get'>
>;

export type TAccountsItemSummary = TAccountsResponse['items'][number];

export interface useFetchInfiniteFilteredAccountsProps {
  search?: string;
  blocked?: boolean;
  include_core?: boolean;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
