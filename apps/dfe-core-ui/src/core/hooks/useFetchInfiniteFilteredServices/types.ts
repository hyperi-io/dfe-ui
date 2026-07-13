import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServicesPath } from './api';

export type TServiceListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServicesPath, 'get'>
>;
export type TServiceSummary = TServiceListResponse['items'][number];
export interface ServiceListRequestParams {
  search?: string;
  service?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredServicesProps = Omit<
  ServiceListRequestParams,
  'page'
>;
