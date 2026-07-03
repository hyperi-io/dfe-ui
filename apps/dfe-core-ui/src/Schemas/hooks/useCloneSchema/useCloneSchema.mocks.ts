import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { setupServer } from 'msw/node';

export const CLONE_SOURCE_SCHEMA_PATH = 'source';
export const CLONE_TARGET_SCHEMA_PATH = 'source/display_name';

const schemaDetailColumn = {
  name: 'string',
  type: 'string',
  attribute: ['string'],
  use_case: 'string',
  expr: 'string',
  _field_type: SCHEMA_FIELD_TYPES.BASE,
  _matched_searchable: ['string'],
};

const handlers = [
  API_CONFIG_MOCKS.schemas.schemaDetail.get.success({
    schema_path: `${CLONE_SOURCE_SCHEMA_PATH}`,
    mockedResponse: {
      path: CLONE_SOURCE_SCHEMA_PATH,
      resource_type: 'custom',
      current: '1.0.0',
      selected: '1.0.0',
      versions: ['1.0.0'],
      version: {
        date: '2021-01-01',
        type: 'model',
        summary: 'description',
        columns: {
          items: [schemaDetailColumn],
          total: 1,
          page: 1,
          per_page: -1,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        },
      },
    },
  }),
  API_CONFIG_MOCKS.schemas.schema.post.success({
    schema_path: CLONE_TARGET_SCHEMA_PATH,
    mockedResponse: {
      path: CLONE_SOURCE_SCHEMA_PATH,
      resource_type: 'custom',
      current: '1.0.0',
      versions: {
        '1.0.0': {
          date: '2021-01-01',
          type: 'model',
          summary: 'description',
          columns: [schemaDetailColumn],
        },
      },
    },
  }),
];

export const server = setupServer(...handlers);
