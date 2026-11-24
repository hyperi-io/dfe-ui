import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { type ReactNode } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ListHuntsProvider, useListHuntsContext } from './index';

const { searchParamsRef } = vi.hoisted(() => ({
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => '/hunts',
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer();
const { wrapper: queryWrapper } = buildTestWrapper().withReactQuery();

const wrapper = ({ children }: { children: ReactNode }) =>
  queryWrapper({
    children: <ListHuntsProvider>{children}</ListHuntsProvider>,
  });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  searchParamsRef.current = new URLSearchParams();
});
afterAll(() => server.close());

describe('ListHuntsProvider', () => {
  it('filters the hunt list by the rule in the url', async () => {
    searchParamsRef.current = new URLSearchParams('rule=brute_force');
    let requestedRule: string | null = null;
    server.use(
      http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, ({ request }) => {
        requestedRule = new URL(request.url).searchParams.get('rule');
        return HttpResponse.json({
          items: [],
          total_size: 0,
          next_page_token: null,
        });
      }),
    );

    const { result } = renderHook(() => useListHuntsContext(), { wrapper });

    await waitFor(() => {
      expect(requestedRule).toBe('brute_force');
    });
    expect(result.current.filters.rule).toBe('brute_force');
    expect(result.current.hasFilters).toBe(true);
  });
});
