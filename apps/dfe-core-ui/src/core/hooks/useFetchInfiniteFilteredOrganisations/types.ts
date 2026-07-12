import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchOrganisationsPath } from './api';

export type TOrganisationListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchOrganisationsPath, 'get'>
>;

export type TOrganisationListSummary =
  TOrganisationListResponse['items'][number];

export interface UseFetchInfiniteFilteredOrganisationsProps {
  search?: string;
  sort_by?: 'name' | 'display_name' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
