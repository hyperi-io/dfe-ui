import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFieldMapsPath } from './api';

export type TFieldMapListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFieldMapsPath, 'get'>
>;

export type TFieldMapSummary = TFieldMapListResponse['items'][number];
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
