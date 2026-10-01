import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { defaultsDriftSourcesPath } from './api';

export type TDefaultsDriftSourcesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof defaultsDriftSourcesPath, 'get'>
>;

export type TDefaultsDriftSourceItem =
  TDefaultsDriftSourcesResponse['items'][number];

export interface UseFetchInfiniteDefaultsDriftSourcesProps {
  search?: string;
  page?: number;
  per_page?: number;
}
