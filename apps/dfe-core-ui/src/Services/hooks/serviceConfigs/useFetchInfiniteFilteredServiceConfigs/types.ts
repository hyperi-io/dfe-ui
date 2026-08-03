import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceConfigsPath } from './api';

export type TServiceConfigListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceConfigsPath, 'get'>
>;
export type TServiceConfigSummary = TServiceConfigListResponse['items'][number];
export interface ServiceConfigListRequestParams {
  search?: string;
  service?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredServiceConfigsProps = Omit<
  ServiceConfigListRequestParams,
  'page'
>;
