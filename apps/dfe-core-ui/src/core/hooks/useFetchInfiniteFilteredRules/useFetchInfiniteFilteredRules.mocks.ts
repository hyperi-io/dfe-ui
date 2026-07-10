import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TRuleListItem } from './types';

export const MOCK_RULE_NAME = 'rule_name';

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
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
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
  });
}

const handlers = [createPaginatedRulesHandler()];

export const server = setupServer(...handlers);
