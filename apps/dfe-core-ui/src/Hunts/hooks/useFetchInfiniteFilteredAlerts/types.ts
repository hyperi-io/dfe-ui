import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredAlertsPath } from './api';
export type TAlertListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredAlertsPath, 'get'>
>;
export type TAlertListResponseItem = TAlertListResponse['items'][number];

export type UseFetchInfiniteFilteredAlertsProps = {
  search?: string;
  hunt?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
};
