import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TSchemaSummary } from './types';

const SCHEMA_ITEM: TSchemaSummary = {
  name: 'string',
  resource_type: 'custom',
  current: 'string',
  versions: ['string'],
  updated_at: 'string',
  column_count: 0,
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SCHEMA_ITEM,
}));

function createPaginatedSchemasHandler() {
  return http.get(API_CONFIG_MOCKS.schemas.default.mockedUrl, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const perPage =
      parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10;

    const start = (page - 1) * perPage;
    const items = ALL_ITEMS.slice(start, start + perPage);
    const totalPages = Math.ceil(TOTAL_ITEMS / perPage);

    return HttpResponse.json({
      items,
      total: TOTAL_ITEMS,
      page,
      per_page: perPage,
      total_pages: totalPages,
      next_page: page < totalPages ? page + 1 : 0,
      prev_page: page > 1 ? page - 1 : 0,
    });
  });
}

const handlers = [createPaginatedSchemasHandler()];

export const server = setupServer(...handlers);
