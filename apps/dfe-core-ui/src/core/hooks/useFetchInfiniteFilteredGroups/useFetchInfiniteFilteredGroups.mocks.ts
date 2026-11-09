import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TGroupsItemSummary } from './types';

const GROUP_ITEM: TGroupsItemSummary = {
  name: 'string',
  description: 'string',
  roles: ['string'],
  members: ['string'],
  scope: 'string',
  source_id: 'string',
  source_provider: 'string',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => GROUP_ITEM);

function createPaginatedGroupsHandler() {
  return http.get(API_CONFIG_MOCKS.groups.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedGroupsHandler()];

export const server = setupServer(...handlers);
