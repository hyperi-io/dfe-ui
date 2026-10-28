import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import {
  TSourceListResponse,
  UseFetchInfiniteFilteredSourcesProps,
} from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { server } from '@/core/hooks/useFetchInfiniteFilteredSources/useFetchInfiniteFilteredSources.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
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
      expect(result.current.fetchNextPage).toBeInstanceOf(Function);
      expect(result.current.loadMoreRef).toBeDefined();
    });

    it('parses filters from URL search params', async () => {
      searchParamsRef.current = new URLSearchParams(
        'search=foo&status=enabled&sort_by=source&sort_order=asc',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.filters).toEqual({
        search: 'foo',
        status: 'enabled',
        sort_by: 'source',
        sort_order: 'asc',
      });
    });

    it('uses defaultFilters when URL has no filter params', async () => {
      const { wrapper: defaultFilterWrapper } = buildTestWrapper()
        .withReactQuery()
        .withListSourcesProvider({
          defaultFilters: {
            search: 'default-search',
            status: 'enabled',
          },
        });

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper: defaultFilterWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.filters).toEqual({
        search: undefined,
        status: undefined,
        sort_by: undefined,
        sort_order: undefined,
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

    it('hasFilters is true when status is set', async () => {
      searchParamsRef.current = new URLSearchParams('status=enabled');

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFilters).toBe(true);
    });

    it('hasFilters is true when sort params are set', async () => {
      searchParamsRef.current = new URLSearchParams(
        'sort_by=source&sort_order=asc',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      expect(result.current.hasFilters).toBe(false);
    });

    it('setFilters calls router.replace with updated query string', async () => {
      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.setFilters({ search: 'new-search', status: 'disabled' });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?search=new-search&status=disabled',
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

      result.current.setFilters({ status: 'enabled' });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?search=existing&status=enabled',
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

    it('drops the detail tab when the selected source changes', async () => {
      searchParamsRef.current = new URLSearchParams(
        'source_name=syslog&source_version=1.0.0&tab=processing',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.selectedSourceName).toBe('syslog');
      });

      result.current.setSelectedSource({
        source_name: 'main',
        source_version: '1.0.0',
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?source_name=main&source_version=1.0.0',
      );
    });

    it('keeps the detail tab when only the version of the same source changes', async () => {
      searchParamsRef.current = new URLSearchParams(
        'source_name=syslog&source_version=1.0.0&tab=configuration',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.selectedSourceName).toBe('syslog');
      });

      result.current.setSelectedSource({
        source_name: 'syslog',
        source_version: '1.0.1',
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?tab=configuration&source_name=syslog&source_version=1.0.1',
      );
    });

    it('opens an explicit detail tab when selecting a source', async () => {
      searchParamsRef.current = new URLSearchParams(
        'source_name=syslog&source_version=1.0.0&tab=processing',
      );

      const { result } = renderHook(() => useListSourcesContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.selectedSourceName).toBe('syslog');
      });

      result.current.setSelectedSource({
        source_name: 'azure',
        source_version: '2.0.0',
        tab: 'buildDeploy',
      });

      expect(mockReplace).toHaveBeenCalledWith(
        '/sources?tab=buildDeploy&source_name=azure&source_version=2.0.0',
      );
    });
  });
});

describe('ListSourcesProvider selected version', () => {
  /** Serve a list whose sources sit at the given current versions. */
  const serveCurrent = (current: Record<string, string>) => {
    const items = Object.entries(current).map(([name, version]) => ({
      name,
      resource_type: 'custom',
      display_name: name,
      enabled: true,
      current: version,
      deployed_version: version,
      versions: [version],
      updated_at: '2026-01-01T00:00:00Z',
      has_transform: false,
      has_fetcher: false,
      origin: 'receiver',
      state: 'active',
      current_table_topic_type: 'own',
    })) as TSourceListResponse['items'];
    server.use(
      http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () =>
        HttpResponse.json({
          items,
          objects: Object.fromEntries(items.map((i) => [i.name, i])),
          total: items.length,
          page: 1,
          per_page: 10,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        } satisfies TSourceListResponse),
      ),
    );
  };

  it.each<{
    name: string;
    query: string;
    current: Record<string, string>;
    expected: string[];
    waitsForList: boolean;
  }>([
    {
      name: 'main opens at the version the list gives it, not a literal',
      query: '',
      current: { main: '1.3.0' },
      expected: ['main', '1.3.0'],
      waitsForList: true,
    },
    {
      name: 'a named source with no version opens at its own current version',
      query: 'source_name=syslog',
      current: { main: '1.3.0', syslog: '2.4.0' },
      expected: ['syslog', '2.4.0'],
      waitsForList: true,
    },
    {
      name: 'a version in the URL wins over the list',
      query: 'source_name=main&source_version=1.0.0',
      current: { main: '1.3.0' },
      expected: ['main', '1.0.0'],
      waitsForList: false,
    },
    {
      name: 'a source the list does not carry falls back to the version every source starts at',
      query: 'source_name=elsewhere',
      current: { main: '1.3.0' },
      expected: ['elsewhere', '1.0.0'],
      waitsForList: true,
    },
  ])('$name', async ({ query, current, expected, waitsForList }) => {
    serveCurrent(current);
    searchParamsRef.current = new URLSearchParams(query);

    const { result } = renderHook(() => useListSourcesContext(), { wrapper });

    if (waitsForList) {
      expect(result.current.selectedSourceVersion).toBeNull();
    }
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect([
      result.current.selectedSourceName,
      result.current.selectedSourceVersion,
    ]).toEqual(expected);
  });

  it('selecting a source with no version follows its current version', async () => {
    serveCurrent({ main: '1.3.0', syslog: '2.4.0' });
    searchParamsRef.current = new URLSearchParams(
      'source_name=main&source_version=1.0.0',
    );
    const { result } = renderHook(() => useListSourcesContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSelectedSource({
        source_name: 'syslog',
        source_version: null,
      });
    });

    expect(result.current.selectedSourceVersion).toBe('2.4.0');
  });
});
