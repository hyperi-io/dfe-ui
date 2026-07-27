import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredOidcProvidersPath } from './api';

export type TListOidcProvidersResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredOidcProvidersPath, 'get'>
>;

export type TOidcProviderListItem = TListOidcProvidersResponse['items'][number];

export interface UseFetchInfiniteFilteredOidcProvidersProps {
  search?: string;
  sort_by?: 'name' | 'type' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
