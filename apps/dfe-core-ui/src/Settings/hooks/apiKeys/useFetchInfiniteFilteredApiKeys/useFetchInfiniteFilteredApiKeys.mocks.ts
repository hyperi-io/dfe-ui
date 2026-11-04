import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TApiKeysItemSummary } from './types';

const API_KEY_ITEM: TApiKeysItemSummary = {
  name: 'string',
  org: '',
  description: 'string',
  groups: ['string'],
  short_token: 'string',
  enabled: true,
  created_at: 'string',
  expires_at: null,
  expired: false,
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => API_KEY_ITEM);

function createPaginatedApiKeysHandler() {
  return http.get(API_CONFIG_MOCKS.apiKeys.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedApiKeysHandler()];

export const server = setupServer(...handlers);
