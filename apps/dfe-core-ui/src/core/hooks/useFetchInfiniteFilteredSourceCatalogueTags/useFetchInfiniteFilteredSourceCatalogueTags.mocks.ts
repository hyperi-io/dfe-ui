import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TInfiniteFilteredSourceCatalogueTagsResponse } from './types';

const SOURCE_ITEM: TInfiniteFilteredSourceCatalogueTagsResponse['items'][number] =
  {
    id: 'string',
    name: 'string',
    description: 'string',
  };

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SOURCE_ITEM,
}));

function createPaginatedCatalogueTagsHandler() {
  return http.get(
    API_CONFIG_MOCKS.sources.catalogueTags.mockedUrl,
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

      const response: TInfiniteFilteredSourceCatalogueTagsResponse = {
        items,
        total: TOTAL_ITEMS,
        page,
        per_page: perPage,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : 0,
        prev_page: page > 1 ? page - 1 : 0,
      };

      return HttpResponse.json(response);
    },
  );
}

const handlers = [createPaginatedCatalogueTagsHandler()];

export const server = setupServer(...handlers);
