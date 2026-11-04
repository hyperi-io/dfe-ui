import type {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

export type TSourceListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<'/api/v1/sources', 'get'>
>;
export type TSourceSummary = TSourceListResponse['objects'];
export type TSourceListSummary = TSourceListResponse['items'][number];
interface SourceListRequestParams {
  search?: string;
  status?: 'enabled' | 'disabled';
  sort_by?: string;
  sort_order?: string;
  page_size?: number;
}

export type UseFetchInfiniteFilteredSourcesProps = Omit<
  SourceListRequestParams,
  'page'
>;
