import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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

function createMetaSchemaDetailResponse(
  page: number,
  perPage: number,
): TMetaSchemaDetailResponse {
  const start = (page - 1) * perPage;
  const items = ALL_ITEMS.slice(start, start + perPage);
  const totalPages = Math.ceil(TOTAL_ITEMS / perPage);

  return {
    path: MOCK_SCHEMA_PATH,
    resource_type: 'custom',
    current: '1.0.0',
    selected: '1.0.0',
    versions: ['1.0.0'],
    version: {
      date: 'string',
      type: 'string',
      summary: 'string',
      columns: {
        items,
        total: TOTAL_ITEMS,
        page,
        per_page: perPage,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    },
  };
}

function createPaginatedSchemaDetailColumnsHandler() {
  return http.get(
    API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
      '{schema_path}',
      MOCK_SCHEMA_PATH,
    ),
    ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(
        1,
        parseInt(url.searchParams.get('page') ?? '1', 10),
      );
      const perPage =
        parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10;

      return HttpResponse.json(createMetaSchemaDetailResponse(page, perPage));
    },
  );
}

const handlers = [createPaginatedSchemaDetailColumnsHandler()];

export const server = setupServer(...handlers);
