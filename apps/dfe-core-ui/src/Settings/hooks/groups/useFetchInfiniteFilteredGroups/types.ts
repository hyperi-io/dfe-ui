import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchGroupsPath } from './api';

export type TGroupsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchGroupsPath, 'get'>
>;

export type TGroupsItemSummary = TGroupsResponse['items'][number];

export interface useFetchInfiniteFilteredGroupsProps {
  search?: string;
  sort_by?: 'name' | 'scope';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
