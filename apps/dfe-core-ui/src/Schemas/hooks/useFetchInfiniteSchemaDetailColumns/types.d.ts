import { components } from '@repo/dfe-engine-types';

export type UseFetchInfiniteFilteredSchemaDetailColumnsProps = {
  schema_path: string;
  version: string;
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
