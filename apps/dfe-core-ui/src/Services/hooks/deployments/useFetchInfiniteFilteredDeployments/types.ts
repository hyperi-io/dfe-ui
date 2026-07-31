import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchDeploymentsPath } from './api';

export type TDeploymentsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchDeploymentsPath, 'get'>
>;

export type TDeploymentsItemSummary = TDeploymentsResponse['items'][number];

export interface UseFetchInfiniteFilteredDeploymentsProps {
  service?: string;
  search?: string;
  sort_by?: 'service' | 'instance' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
