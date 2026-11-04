import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
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
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedSchemasHandler()];

export const server = setupServer(...handlers);
