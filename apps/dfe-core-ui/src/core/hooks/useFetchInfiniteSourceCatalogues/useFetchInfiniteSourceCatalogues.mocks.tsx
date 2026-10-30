import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TSourceCatalogueItem } from './types';

export const SOURCE_CATALOGUE_ITEM: TSourceCatalogueItem = {
  name: 'string',
  package: 'string',
  data_stream: 'string',
  dataset: 'string',
  intakes: ['beats'],
  default_intake: 'beats',
  has_schema: true,
  variants: ['string'],
  availability: 'available',
  availability_reason: 'string',
  runnable: true,
  runnable_reason: 'string',
  runnable_intakes: ['beats'],
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SOURCE_CATALOGUE_ITEM,
}));

function createPaginatedSourceCataloguesHandler() {
  return http.get(
    API_CONFIG_MOCKS.sources.catalogue.mockedUrl,
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

const handlers = [createPaginatedSourceCataloguesHandler()];

export const server = setupServer(...handlers);
