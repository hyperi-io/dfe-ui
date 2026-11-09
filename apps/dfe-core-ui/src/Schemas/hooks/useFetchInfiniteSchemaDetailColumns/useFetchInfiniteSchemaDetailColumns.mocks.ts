import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  TMetaSchemaDetailColumnItem,
  TMetaSchemaDetailResponse,
} from './types';

export const MOCK_SCHEMA_PATH = 'path';

const SCHEMA_DETAIL_COLUMN_ITEM: TMetaSchemaDetailColumnItem = {
  name: 'string',
  type: 'string',
  attribute: ['string'],
  use_case: 'string',
  expr: 'string',
  _matched_searchable: [],
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SCHEMA_DETAIL_COLUMN_ITEM,
}));

function createPaginatedSchemaDetailColumnsHandler() {
  return http.get(
    API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
      '{schema_path}',
      MOCK_SCHEMA_PATH,
    ),
    ({ request }) => {
      const response: TMetaSchemaDetailResponse = {
        path: MOCK_SCHEMA_PATH,
        resource_type: 'custom',
        current: '1.0.0',
        selected: '1.0.0',
        versions: ['1.0.0'],
        version: {
          date: 'string',
          type: 'string',
          summary: 'string',
        },
        ...pageOf(ALL_ITEMS, request),
      };

      return HttpResponse.json(response);
    },
  );
}

const handlers = [createPaginatedSchemaDetailColumnsHandler()];

export const server = setupServer(...handlers);
