import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TSourceListResponse, TSourceListSummary } from './types';

const SOURCE_ITEM: TSourceListSummary = {
  name: 'string',
  display_name: 'string',
  enabled: true,
  current: 'string',
  deployed_version: 'string',
  versions: ['string'],
  updated_at: 'string',
  has_transform: false,
  has_fetcher: false,
  state: 'active',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SOURCE_ITEM,
}));

function createPaginatedSourcesHandler() {
  return http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const perPage =
      parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10;

    const start = (page - 1) * perPage;
    const items = ALL_ITEMS.slice(start, start + perPage);
    const totalPages = Math.ceil(TOTAL_ITEMS / perPage);

    const response: TSourceListResponse = {
      items,
      total: TOTAL_ITEMS,
      objects: ALL_ITEMS.reduce(
        (acc, item) => {
          acc[item.name] = item;
          return acc;
        },
        {} as Record<string, TSourceListSummary>,
      ),
      page,
      per_page: perPage,
      total_pages: totalPages,
      next_page: page < totalPages ? page + 1 : 0,
      prev_page: page > 1 ? page - 1 : 0,
    };

    return HttpResponse.json(response);
  });
}

const handlers = [createPaginatedSourcesHandler()];

export const server = setupServer(...handlers);
