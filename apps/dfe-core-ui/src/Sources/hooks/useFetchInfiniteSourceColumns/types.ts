import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sourceColumnsPath } from './api';

export type TSourceColumnsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceColumnsPath, 'get'>
>;

export type TSourceColumnItem = TSourceColumnsResponse['items'][number];

export interface UseFetchInfiniteSourceColumnsProps {
  source_name?: string;
  version?: string;
  per_page?: number;
}
