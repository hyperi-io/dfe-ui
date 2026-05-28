import { components } from '@repo/dfe-engine-types';

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
};

export type MetaSchemaDetailResponse =
  components['schemas']['MetaSchemaGetResponse'];
