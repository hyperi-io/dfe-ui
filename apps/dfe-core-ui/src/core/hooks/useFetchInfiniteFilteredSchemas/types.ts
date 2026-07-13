import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSchemasPath } from './api';

export interface UseFetchInfiniteFilteredSchemasProps {
  search?: string;
  schema_type?: string[];
  sort_by?: 'path' | 'description';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export type TSchemaListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSchemasPath, 'get'>
>;

export type TSchemaSummary = TSchemaListResponse['items'][number];
