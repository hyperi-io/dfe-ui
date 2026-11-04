import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TSourceListResponse, TSourceListSummary } from './types';

const SOURCE_ITEM: TSourceListSummary = {
  name: 'string',
  resource_type: 'custom',
  display_name: 'string',
  enabled: true,
  current: 'string',
  deployed_version: 'string',
  versions: ['string'],
  updated_at: 'string',
  has_transform: false,
  has_fetcher: false,
  origin: 'receiver',
  state: 'active',
  current_table_topic_type: 'own',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...SOURCE_ITEM,
}));

function createPaginatedSourcesHandler() {
  return http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, ({ request }) => {
    const response: TSourceListResponse = {
      ...pageOf(ALL_ITEMS, request),
      objects: ALL_ITEMS.reduce(
        (acc, item) => {
          acc[item.name] = item;
          return acc;
        },
        {} as Record<string, TSourceListSummary>,
      ),
    };

    return HttpResponse.json(response);
  });
}

const handlers = [createPaginatedSourcesHandler()];

export const server = setupServer(...handlers);
