import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSourcesPath } from './api';

export type TSourceListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSourcesPath, 'get'>
>;

export type TSourceSummary = TSourceListResponse['objects'];
export type TSourceListSummary = TSourceListResponse['items'][number];
interface SourceListRequestParams {
  search?: string;
  status?: 'enabled' | 'disabled';
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredSourcesProps = Omit<
  SourceListRequestParams,
  'page'
>;
