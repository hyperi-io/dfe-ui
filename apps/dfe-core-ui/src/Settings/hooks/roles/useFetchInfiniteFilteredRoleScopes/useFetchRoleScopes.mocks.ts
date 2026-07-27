import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TRoleScopeItem } from './types';

const ROLE_SCOPE_ITEM: TRoleScopeItem = 'string';

const TOTAL_ITEMS = 25;
const ALL_SCOPES = Array.from({ length: TOTAL_ITEMS }, () => ROLE_SCOPE_ITEM);

function createPaginatedRoleScopesHandler() {
  return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const perPage =
      parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10;

    const start = (page - 1) * perPage;
    const scopes = ALL_SCOPES.slice(start, start + perPage);
    const totalPages = Math.ceil(TOTAL_ITEMS / perPage);

    return HttpResponse.json({
      scopes,
      total: TOTAL_ITEMS,
      page,
      per_page: perPage,
      total_pages: totalPages,
      next_page: page < totalPages ? page + 1 : 0,
      prev_page: page > 1 ? page - 1 : 0,
    });
  });
}

const handlers = [createPaginatedRoleScopesHandler()];

export const server = setupServer(...handlers);
