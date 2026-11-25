import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { OrganisationManagement } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const org = (name: string, display_name: string) => ({
  name,
  display_name,
  org_ids: [name],
  enabled: true,
  created_at: '',
  updated_at: '',
});

// Your organisation (acme) sorts among the others and is left out of the grid.
const ORGS = [
  org('acme', 'Acme'),
  ...Array.from({ length: 14 }, (_, i) =>
    org(`org-${i}`, `Org ${String(i).padStart(2, '0')}`),
  ),
].sort((a, b) => a.display_name.localeCompare(b.display_name));

const server = setupServer(
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'acme', display_name: 'Acme' },
  }),
  http.get('/api/v1/orgs/acme', () => HttpResponse.json(org('acme', 'Acme'))),
  http.get('/api/v1/orgs', ({ request }) => {
    const params = new URL(request.url).searchParams;
    orderedBy.push(params.get('order_by'));
    const start = Number(params.get('page_token') ?? 0);
    const size = Number(params.get('page_size'));
    const end = start + size;
    return HttpResponse.json({
      items: ORGS.slice(start, end),
      total_size: ORGS.length,
      next_page_token: end < ORGS.length ? String(end) : null,
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const cardNames = () =>
  screen
    .queryAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);

const orderedBy: (string | null)[] = [];

describe('OrganisationManagement', () => {
  test('shows six, then the rest as it scrolls', async () => {
    const user = userEvent.setup();
    render(<OrganisationManagement />, { wrapper });

    expect(await screen.findByText('Org 05')).toBeInTheDocument();
    expect(cardNames()).toEqual([
      'Org 00',
      'Org 01',
      'Org 02',
      'Org 03',
      'Org 04',
      'Org 05',
    ]);

    await user.click(screen.getByRole('button', { name: 'Show more' }));
    // Show more turns the list to scrolling, which reads the rest in larger pages.
    expect(await screen.findByText('Org 13')).toBeInTheDocument();
    expect(cardNames()).toHaveLength(14);
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument();
    expect(new Set(orderedBy)).toEqual(new Set(['display_name']));
  });
});
