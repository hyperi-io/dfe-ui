import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const FIELD_MAP_ITEM = {
  standard: 'string',
  source: 'string',
  is_default: false,
  version: 'string',
  mapping_count: 0,
  updated_at: 'string',
} as const;

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...FIELD_MAP_ITEM,
}));

function createPaginatedFieldMapsHandler() {
  return http.get(
    API_CONFIG_MOCKS.fieldMaps.default.mockedUrl,
    ({ request }) => {
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedFieldMapsHandler()];

export const server = setupServer(...handlers);
