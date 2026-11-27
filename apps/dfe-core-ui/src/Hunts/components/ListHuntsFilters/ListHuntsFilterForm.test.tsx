import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { ListHuntsProvider } from '@/Hunts/contexts/ListHuntsContext';
import { render, screen, waitFor } from '@testing-library/react';
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
import { ListHuntsFilterForm } from './ListHuntsFilterForm';

const { searchParamsRef, replace } = vi.hoisted(() => ({
  searchParamsRef: { current: new URLSearchParams() },
  replace: vi.fn(),
}));

// Ace's beautify extension reads a global that only the app shell sets.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => '/hunts',
}));

vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

const emptyPage = { items: [], total_size: 0, next_page_token: null };

const server = setupServer(
  http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, () =>
    HttpResponse.json(emptyPage),
  ),
  http.get(API_CONFIG_MOCKS.rules.default.mockedUrl, () =>
    HttpResponse.json(emptyPage),
  ),
);

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  replace.mockClear();
  searchParamsRef.current = new URLSearchParams();
});
afterAll(() => server.close());

const lastQuery = () => {
  const url = replace.mock.calls.at(-1)?.[0] as string | undefined;
  return new URLSearchParams(url?.split('?')[1] ?? '');
};

describe('ListHuntsFilterForm sort', () => {
  test('turning the direction keeps the sort column', async () => {
    searchParamsRef.current = new URLSearchParams(
      'sort_by=name&sort_order=asc',
    );
    const user = userEvent.setup();
    render(
      <ListHuntsProvider>
        <ListHuntsFilterForm />
      </ListHuntsProvider>,
      { wrapper },
    );

    await user.click(screen.getByText('Sort by'));
    await user.click(screen.getByRole('button', { name: 'Sort ascending' }));

    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(lastQuery().get('sort_by')).toBe('name');
    expect(lastQuery().get('sort_order')).toBe('desc');
  });
});
