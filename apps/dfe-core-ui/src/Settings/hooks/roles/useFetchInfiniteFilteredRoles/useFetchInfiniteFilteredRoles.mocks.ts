import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TRoleListItem } from './types';

const ROLE_ITEM: TRoleListItem = {
  name: 'string',
  description: 'string',
  permissions: ['string'],
  scoped: false,
  resource_type: 'string',
} as const;

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...ROLE_ITEM,
}));

function createPaginatedRolesHandler() {
  return http.get(API_CONFIG_MOCKS.roles.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedRolesHandler()];

export const server = setupServer(...handlers);
