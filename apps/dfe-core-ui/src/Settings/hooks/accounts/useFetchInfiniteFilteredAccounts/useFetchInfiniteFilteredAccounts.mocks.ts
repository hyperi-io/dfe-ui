import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
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
  org: '',
  oidc_id: 'string',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ACCOUNT_ITEM);

function createPaginatedAccountsHandler() {
  return http.get(
    API_CONFIG_MOCKS.accounts.default.mockedUrl,
    ({ request }) => {
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedAccountsHandler()];

export const server = setupServer(...handlers);
