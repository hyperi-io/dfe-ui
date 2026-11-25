import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { GroupManagement } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const group = (name: string, scope: string, members: string[] = []) => ({
  name,
  description: '',
  roles: [],
  members,
  linked_members: [],
  scope,
  source_id: '',
  source_provider: '',
});

const page = <T,>(items: T[]) => ({
  items,
  total_size: items.length,
  next_page_token: null,
});

const orders: (string | null)[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'acme', display_name: 'Acme' },
  }),
  http.get('/api/v1/auth/groups', ({ request }) => {
    orders.push(new URL(request.url).searchParams.get('order_by'));
    return HttpResponse.json(
      page([
        group('dfe-admins', 'system', ['admin']),
        group('acme-admins', 'org:acme'),
        group('acme-viewers', 'org:acme'),
        group('globex-admins', 'org:globex', ['greg']),
        group('globex-viewers', 'org:globex', ['gina', 'gus']),
      ]),
    );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('GroupManagement', () => {
  test("lists the groups and leaves out each organisation's admin and viewer groups", async () => {
    render(<GroupManagement />, { wrapper });

    expect(await screen.findByText('dfe-admins')).toBeInTheDocument();
    for (const name of [
      'acme-admins',
      'acme-viewers',
      'globex-admins',
      'globex-viewers',
    ]) {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    }
    expect(screen.queryByText('Organisation roles')).not.toBeInTheDocument();
    expect(orders[0]).toBe('name');
  });
});
