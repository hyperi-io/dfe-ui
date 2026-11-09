import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFieldMapsPath } from './api';

export type TFieldMapListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFieldMapsPath, 'get'>
>;

export type TFieldMapSummary = TFieldMapListResponse['items'][number];
interface FieldMapListRequestParams {
  search?: string;
  standard?: string;
  sort_by?: string;
  sort_order?: string;
  page_size?: number;
}

export type UseFetchInfiniteFilteredFieldMapsProps = Omit<
  FieldMapListRequestParams,
  'page'
>;
