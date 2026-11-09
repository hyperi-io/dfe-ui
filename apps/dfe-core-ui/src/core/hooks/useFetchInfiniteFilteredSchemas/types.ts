import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSchemasPath } from './api';

export interface UseFetchInfiniteFilteredSchemasProps {
  search?: string;
  schema_type?: string[];
  sort_by?: 'path' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page_size?: number;
}

export type TSchemaListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSchemasPath, 'get'>
>;

export type TSchemaSummary = TSchemaListResponse['items'][number];
