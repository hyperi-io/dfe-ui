import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
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
      const response: TInfiniteFilteredSourceCatalogueTagsResponse = pageOf(
        ALL_ITEMS,
        request,
      );

      return HttpResponse.json(response);
    },
  );
}

const handlers = [createPaginatedCatalogueTagsHandler()];

export const server = setupServer(...handlers);
