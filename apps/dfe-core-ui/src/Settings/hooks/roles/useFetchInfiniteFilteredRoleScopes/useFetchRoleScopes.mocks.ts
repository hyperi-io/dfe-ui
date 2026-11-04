import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TRoleScopeItem } from './types';

const ROLE_SCOPE_ITEM: TRoleScopeItem = 'string';

const TOTAL_ITEMS = 25;
const ALL_SCOPES = Array.from({ length: TOTAL_ITEMS }, () => ROLE_SCOPE_ITEM);

function createPaginatedRoleScopesHandler() {
  return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, ({ request }) => {
    return HttpResponse.json(
      pageOf(ALL_SCOPES, request, {
        wildcard: false,
        argo_namespace_prefix: 'string',
        notes: 'string',
      }),
    );
  });
}

const handlers = [createPaginatedRoleScopesHandler()];

export const server = setupServer(...handlers);
