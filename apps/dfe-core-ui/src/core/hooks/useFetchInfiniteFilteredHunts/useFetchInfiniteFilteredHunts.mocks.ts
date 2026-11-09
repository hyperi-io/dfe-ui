import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { THuntListItem } from './types';

const HUNT_ITEM: THuntListItem = {
  display_name: 'string',
  name: 'string',
  source_table: 'string',
  target_table: 'string',
  customer: 'string',
  cron: 'string',
  rules: ['string'],
  running: false,
  too_aggressive: false,
  run_requested: false,
} as const;

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...HUNT_ITEM,
}));

function createPaginatedHuntsHandler() {
  return http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedHuntsHandler()];

export const server = setupServer(...handlers);
