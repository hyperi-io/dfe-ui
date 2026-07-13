import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteSchemaDetailColumnsPath } from './api';

export type SchemaDetailColumnFilterField =
  | 'search'
  | 'name'
  | 'type'
  | 'attribute'
  | 'use_case'
  | 'expr'
  | 'comment';

export type SchemaDetailColumnFilters = Partial<
  Pick<
    UseFetchInfiniteFilteredSchemaDetailColumnsProps,
    SchemaDetailColumnFilterField
  >
>;

export type UseFetchInfiniteFilteredSchemaDetailColumnsProps = {
  schema_path: string | null;
  version: string | null;
  search?: string;
  name?: string;
  type?: string;
  use_case?: string;
  expr?: string;
  comment?: string;
  attribute?: string;
  per_page?: number;
  enabled?: boolean;
};

export type TMetaSchemaDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteSchemaDetailColumnsPath, 'get'>
>;

export type TMetaSchemaDetailColumnItem =
  TMetaSchemaDetailResponse['version']['columns']['items'][number];
