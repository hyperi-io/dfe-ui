import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TDefaultsDriftSourceItem } from './types';

export const MOCK_SEARCH = 'search';

const DEFAULTS_DRIFT_SOURCE_ITEM: TDefaultsDriftSourceItem = {
  source: 'string',
  core: true,
  drifted: ['string'],
  ttl_days: { stored: 'string', default: 'string' },
  common_header_type: { stored: 'string', default: 'string' },
  common_header_version: { stored: 'string', default: 'string' },
  engine: { stored: 'string', default: 'string' },
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...DEFAULTS_DRIFT_SOURCE_ITEM,
}));

function createPaginatedDefaultsDriftSourcesHandler() {
  return http.get(
    API_CONFIG_MOCKS.system.defaultsDrift.mockedUrl.replace(
      '{search}',
      MOCK_SEARCH,
    ),
    ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(
        1,
        parseInt(url.searchParams.get('page') ?? '1', 10),
      );
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
    },
  );
}

const handlers = [createPaginatedDefaultsDriftSourcesHandler()];

export const server = setupServer(...handlers);
