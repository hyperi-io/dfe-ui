import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
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
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedSourceCataloguesHandler()];

export const server = setupServer(...handlers);
