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
  email_verified: false,
  identities: [],
  password_change_required: false,
  groups: ['string'],
  created_at: '2021-01-01',
  updated_at: '2021-01-01',
  last_login_at: '',
  email: 'string',
  phone: 'string',
  name: 'string',
  org: '',
  org_enabled: true,
  oidc_id: 'string',
  oidc_type: 'string',
  admin: false,
  org_display_name: '',
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
