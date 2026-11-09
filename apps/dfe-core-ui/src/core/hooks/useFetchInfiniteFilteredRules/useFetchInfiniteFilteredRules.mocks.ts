import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TRuleListItem } from './types';

const RULE_ITEM: TRuleListItem = {
  display_name: 'string',
  name: 'string',
  severity: 'string',
  source: 'string',
  source_db: 'string',
  source_table: 'string',
  hunt_name: 'string',
  created_at: 'string',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...RULE_ITEM,
}));

function createPaginatedRulesHandler() {
  return http.get(API_CONFIG_MOCKS.rules.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedRulesHandler()];

export const server = setupServer(...handlers);
