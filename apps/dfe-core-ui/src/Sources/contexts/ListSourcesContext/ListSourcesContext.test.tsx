import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { UseFetchInfiniteFilteredSourcesProps } from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';
import { server } from '@/Sources/hooks/useFetchInfiniteFilteredSources/useFetchInfiniteFilteredSources.mocks';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useListSourcesContext } from './index';

const { mockReplace, searchParamsRef, pathnameRef } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  pathnameRef: { current: '/sources' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => pathnameRef.current,
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const defaultFilters: UseFetchInfiniteFilteredSourcesProps = {};
const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withListSourcesProvider({ defaultFilters });

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  mockReplace.mockClear();
  searchParamsRef.current = new URLSearchParams();
  pathnameRef.current = '/sources';
});
afterAll(() => server.close());

describe('ListSourcesContext', () => {
  describe('useListSourcesContext', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('throws when used outside ListSourcesProvider', () => {
      const { wrapper: noProviderWrapper } =
        buildTestWrapper().withReactQuery();

      expect(() =>
        renderHook(() => useListSourcesContext(), {
          wrapper: noProviderWrapper,
        }),
      ).toThrow(
        'useListSourcesContext must be used within a ListSourcesProvider',
      );
    });
  });

  describe('ListSourcesProvider', () => {
    it('provides context with correct structure', async () => {
      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toMatchObject({
        data: expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          per_page: expect.any(Number),
        }),
        filters: expect.any(Object),
        hasFilters: expect.any(Boolean),
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: expect.any(Boolean),
        isFetchingNextPage: false,
      });
      expect(result.current.setFilters).toBeInstanceOf(Function);
      expect(result.current.refetch).toBeInstanceOf(Function);
      expect(result.current.fetchNextPage).toBeInstanceOf(Function);
      expect(result.current.loadMoreRef).toBeDefined();
    });

    it('parses filters from URL search params', async () => {
      searchParamsRef.current = new URLSearchParams(
        'search=foo&enabled=true&sort_by=source&sort_order=asc&per_page=25',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.filters).toEqual({
        search: 'foo',
        enabled: 'true',
        sort_by: 'source',
        sort_order: 'asc',
        per_page: 25,
      });
    });

    it('uses defaultFilters when URL has no filter params', async () => {
      const { wrapper: defaultFilterWrapper } = buildTestWrapper()
        .withReactQuery()
        .withListSourcesProvider({
          defaultFilters: {
            search: 'default-search',
            enabled: 'true' as const,
          },
        });

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper: defaultFilterWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.filters).toEqual({
        search: 'default-search',
        enabled: 'true',
      });
    });

    it('prefers URL params over defaultFilters when both exist', async () => {
      searchParamsRef.current = new URLSearchParams('search=from-url');
      const { wrapper: searchParamsWrapper } = buildTestWrapper()
        .withReactQuery()
        .withListSourcesProvider({
          defaultFilters: { search: 'from-default' },
        });

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper: searchParamsWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.filters.search).toBe('from-url');
    });

    it('hasFilters is true when search is set', async () => {
      searchParamsRef.current = new URLSearchParams('search=foo');

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFilters).toBe(true);
    });

    it('hasFilters is true when enabled is set', async () => {
      searchParamsRef.current = new URLSearchParams('enabled=true');

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFilters).toBe(true);
    });

    it('hasFilters is true when sort/per_page params are set', async () => {
      searchParamsRef.current = new URLSearchParams(
        'sort_by=source&sort_order=asc&per_page=20',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      expect(result.current.hasFilters).toBe(true);
    });

    it('setFilters calls router.replace with updated query string', async () => {
      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.setFilters({ search: 'new-search', enabled: 'false' });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?search=new-search&enabled=false',
      );
    });

    it('setFilters merges new filters with existing filters', async () => {
      searchParamsRef.current = new URLSearchParams('search=existing');

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.setFilters({ enabled: 'true' });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?search=existing&enabled=true',
      );
    });

    it('setFilters with explicit undefined clears params and navigates to pathname only', async () => {
      searchParamsRef.current = new URLSearchParams('search=foo');

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.setFilters({ search: undefined });

      expect(mockReplace).toHaveBeenCalledWith('/sources');
    });
  });
});
