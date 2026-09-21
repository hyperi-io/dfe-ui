import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TMetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { setupServer } from 'msw/node';

export const BASE_SCHEMA_PATH = 'meta/filebeat';
export const BASE_SCHEMA_VERSION = '1.0.0';

const column = (
  overrides: Partial<
    TMetaSchemaDetailResponse['version']['columns']['items'][number]
  > & { name: string },
) => ({
  type: 'String',
  attribute: [],
  use_case: '',
  expr: '',
  comment: '',
  _field_type: SCHEMA_FIELD_TYPES.BASE,
  ...overrides,
});

export const BASE_COLUMNS_RESPONSE: TMetaSchemaDetailResponse = {
  path: BASE_SCHEMA_PATH,
  current: BASE_SCHEMA_VERSION,
  selected: BASE_SCHEMA_VERSION,
  versions: [BASE_SCHEMA_VERSION],
  resource_type: 'custom',
  version: {
    date: '2026-09-21',
    type: 'model',
    summary: 'filebeat',
    columns: {
      items: [
        column({ name: 'timestamp', type: 'DateTime64', use_case: 'range' }),
        column({
          name: 'host_name',
          attribute: ['lowcardinality'],
          use_case: 'dimension',
          comment: 'Reporting host',
        }),
        // Written before the rename, so the picker has to read it as word_search.
        column({ name: 'message', use_case: 'fulltext' }),
        column({ name: 'log_offset', type: 'Int64' }),
      ],
      total: 4,
      page: 1,
      per_page: 200,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    },
  },
};

export const server = setupServer(
  API_CONFIG_MOCKS.schemas.schemaDetail.get.success({
    mockedResponse: BASE_COLUMNS_RESPONSE,
    schema_path: BASE_SCHEMA_PATH,
  }),
);
