import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchApiKeysPath } from './api';

export type TApiKeysResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchApiKeysPath, 'get'>
>;

export type TApiKeysItemSummary = TApiKeysResponse['items'][number];

export interface useFetchInfiniteFilteredApiKeysProps {
  search?: string;
  sort_by?: 'name' | 'scope';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
