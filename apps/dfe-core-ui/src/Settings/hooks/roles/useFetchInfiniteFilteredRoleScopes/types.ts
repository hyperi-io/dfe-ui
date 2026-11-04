import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredRoleScopesPath } from './api';

export type TRoleScopesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredRoleScopesPath, 'get'>
>;

export type TRoleScopeItem = TRoleScopesResponse['items'][number];

export interface UseFetchInfiniteFilteredRoleScopesProps {
  search?: string;
  page_size?: number;
}
