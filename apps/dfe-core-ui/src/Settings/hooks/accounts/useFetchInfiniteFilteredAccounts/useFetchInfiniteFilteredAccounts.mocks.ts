import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TAccountsItemSummary } from './types';

const ACCOUNT_ITEM: TAccountsItemSummary = {
  username: 'string',
  enabled: true,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  external: false,
  password_change_required: false,
  groups: ['string'],
  created_at: '2021-01-01',
  updated_at: '2021-01-01',
  email: 'string',
  phone: 'string',
  name: 'string',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ACCOUNT_ITEM);

function createPaginatedAccountsHandler() {
  return http.get(
    API_CONFIG_MOCKS.accounts.default.mockedUrl,
    ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(
        1,
        parseInt(url.searchParams.get('page') ?? '1', 10),
      );
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
    },
  );
}

const handlers = [createPaginatedAccountsHandler()];

export const server = setupServer(...handlers);
