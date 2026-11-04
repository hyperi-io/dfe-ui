import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TSourceColumnItem } from './types';

export const MOCK_SOURCE_NAME = 'source';

const SOURCE_COLUMN_ITEM: TSourceColumnItem = {
  name: 'string',
  type: 'string',
  use_case: 'string',
  attribute: ['string'],
  description: 'string',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SOURCE_COLUMN_ITEM,
}));

function createPaginatedSourceColumnsHandler() {
  return http.get(
    API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
      '{name}',
      MOCK_SOURCE_NAME,
    ),
    ({ request }) => {
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedSourceColumnsHandler()];

export const server = setupServer(...handlers);
