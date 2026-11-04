import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
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
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedDefaultsDriftSourcesHandler()];

export const server = setupServer(...handlers);
