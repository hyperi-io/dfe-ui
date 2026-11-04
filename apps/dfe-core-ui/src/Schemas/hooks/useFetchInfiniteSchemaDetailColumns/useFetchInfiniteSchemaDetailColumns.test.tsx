import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { problem } from '@/core/utils/test-utils/problem';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
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
import { useFetchInfiniteFilteredSchemaDetailColumns } from '.';
import {
  TMetaSchemaDetailColumnItem,
  UseFetchInfiniteFilteredSchemaDetailColumnsProps,
} from './types';
import {
  MOCK_SCHEMA_PATH,
  server,
} from './useFetchInfiniteSchemaDetailColumns.mocks';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const { wrapper } = buildTestWrapper().withReactQuery();

const DEFAULT_HOOK_PROPS: UseFetchInfiniteFilteredSchemaDetailColumnsProps = {
  schema_path: MOCK_SCHEMA_PATH,
  version: '1.0.0',
};

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

describe('useFetchInfiniteFilteredSchemaDetailColumns', () => {
  describe('initial loading state', () => {
    it('should start with loading state and empty data', () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(false);
      expect(result.current.isFetchingNextPage).toBe(false);
    });
  });

  describe('successful data fetch', () => {
    it('should fetch and return first page of schema detail columns', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const responseItem: TMetaSchemaDetailColumnItem = {
        name: 'string',
        type: 'string',
        attribute: ['string'],
        use_case: 'string',
        expr: 'string',
      };

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toHaveLength(10);
      expect(result.current.data?.items[0]).toMatchObject(responseItem);
      expect(result.current.isError).toBe(false);
    });

    it('should return all expected properties', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toMatchObject({
        data: {
          path: MOCK_SCHEMA_PATH,
          items: expect.any(Array),
          total_size: 25,
          next_page_token: expect.any(String),
        },
        isLoading: false,
        isError: false,
        error: null,
        fetchNextPage: expect.any(Function),
        hasNextPage: expect.any(Boolean),
        isFetchingNextPage: false,
      });
      expect(result.current.loadMoreRef).toBeDefined();
      expect(result.current.loadMoreRef.current).toBeNull();
    });
  });

  describe('pagination', () => {
    it('should fetch next page when fetchNextPage is called', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toHaveLength(10);

      void result.current.fetchNextPage();

      await waitFor(
        () => {
          expect(result.current.data?.items).toHaveLength(20);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.items[0].name).toBe('string');
      expect(result.current.data?.items[10].name).toBe('string');
      expect(result.current.isFetchingNextPage).toBe(false);
    });

    it('should flatten multiple pages correctly', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toHaveLength(10);

      await result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data?.items.length).toBe(20);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.items).toHaveLength(20);
      expect(result.current.data?.items[0].name).toBe('string');
      expect(result.current.data?.items[10].name).toBe('string');
      expect(result.current.data?.items[19].name).toBe('string');
    });

    it('should not have next page when all data is loaded', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            page_size: 10,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      void result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data?.items.length).toBeGreaterThanOrEqual(20);
        },
        { timeout: 3000 },
      );

      void result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data?.items).toHaveLength(25);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.items).toHaveLength(25);
    });
  });

  describe('custom page size', () => {
    it('should respect page_size parameter', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            page_size: 5,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toHaveLength(5);
    });

    it('should handle page_size larger than available data', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            page_size: 100,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toHaveLength(25);
    });
  });

  describe('error handling', () => {
    it('should handle error state correctly', async () => {
      server.use(
        API_CONFIG_MOCKS.schemas.schemaDetail.get.error({
          schema_path: MOCK_SCHEMA_PATH,
        }),
      );

      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeNull();
    });
  });

  describe('search parameters', () => {
    it('should include search in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            search: 'test',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
    });

    it('should include name filter in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            name: 'test',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
    });

    it('should include type filter in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            type: 'string',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
    });

    it('should include use_case filter in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            use_case: 'dimension',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
    });

    it('should handle multiple filters simultaneously', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            search: 'test',
            name: 'test',
            type: 'string',
            use_case: 'dimension',
            page_size: 20,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toBeDefined();
    });
  });

  describe('loadMoreRef', () => {
    it('should provide a ref object for infinite scroll', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.loadMoreRef).toBeDefined();
      expect(result.current.loadMoreRef).toHaveProperty('current');
    });
  });

  describe('isFetchingNextPage state', () => {
    it('should handle fetchNextPage and complete successfully', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFetchingNextPage).toBe(false);
      const initialLength = result.current.data?.items?.length ?? 0;

      void result.current.fetchNextPage();

      await waitFor(
        () => {
          expect(result.current.data?.items?.length ?? 0).toBeGreaterThan(
            initialLength,
          );
        },
        { timeout: 3000 },
      );

      expect(result.current.isFetchingNextPage).toBe(false);
    });

    it('should keep isFetchingNextPage false when not fetching', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFetchingNextPage).toBe(false);
    });
  });

  describe('empty results', () => {
    it('should handle empty column results', async () => {
      server.use(
        API_CONFIG_MOCKS.schemas.schemaDetail.get.success({
          schema_path: MOCK_SCHEMA_PATH,
          mockedResponse: {
            path: MOCK_SCHEMA_PATH,
            resource_type: 'custom',
            current: '1.0.0',
            selected: '1.0.0',
            versions: ['1.0.0'],
            version: {
              date: 'string',
              type: 'string',
              summary: 'string',
            },
            items: [],
            total_size: 0,
            next_page_token: null,
          },
        }),
      );

      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.items).toHaveLength(0);
      expect(result.current.isError).toBe(false);
    });
  });

  describe('query parameter changes', () => {
    it('should refetch when search changes', async () => {
      const { result, rerender } = renderHook(
        ({ search }) =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            search,
          }),
        {
          wrapper,
          initialProps: { search: '' },
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      rerender({ search: 'new search' });

      await waitFor(() => {
        expect(result.current.data?.items).toBeDefined();
      });
    });
  });

  describe('fetch_all', () => {
    const columnsUrl = API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
      '{schema_path}',
      MOCK_SCHEMA_PATH,
    );
    const columnsPage = (names: string[], next: string | null) =>
      HttpResponse.json({
        path: MOCK_SCHEMA_PATH,
        resource_type: 'custom',
        current: '1.0.0',
        selected: '1.0.0',
        versions: ['1.0.0'],
        version: { date: 'd', type: 'model', summary: 's' },
        items: names.map((name) => ({ name, type: 'string' })),
        next_page_token: next,
        total_size: 3,
      });

    it('holds the columns back until the last page has landed', async () => {
      const tokens: (string | null)[] = [];
      server.use(
        http.get(columnsUrl, ({ request }) => {
          const token = new URL(request.url).searchParams.get('page_token');
          tokens.push(token);
          return token
            ? columnsPage(['c'], null)
            : columnsPage(['a', 'b'], 'next');
        }),
      );

      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            fetch_all: true,
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.data?.items).toHaveLength(3);
      });
      expect(result.current.data?.items.map((item) => item.name)).toEqual([
        'a',
        'b',
        'c',
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(tokens).toEqual([null, 'next']);
    });

    it('shows no columns while another version loads', async () => {
      let releaseB: () => void = () => {};
      const versionB = new Promise<void>((resolve) => {
        releaseB = resolve;
      });
      server.use(
        http.get(columnsUrl, async ({ request }) => {
          const version = new URL(request.url).searchParams.get('version');
          if (version === '2.0.0') {
            await versionB;
            return columnsPage(['b-column'], null);
          }
          return columnsPage(['a-column'], null);
        }),
      );

      const { result, rerender } = renderHook(
        ({ version }) =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            version,
            fetch_all: true,
          }),
        { wrapper, initialProps: { version: '1.0.0' } },
      );

      await waitFor(() => {
        expect(result.current.data?.items[0]?.name).toBe('a-column');
      });

      rerender({ version: '2.0.0' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
      expect(result.current.data).toBeNull();

      releaseB();
      await waitFor(() => {
        expect(result.current.data?.items[0]?.name).toBe('b-column');
      });
    });

    it('reports a failed page as an error, with no columns and no retry loop', async () => {
      let continuations = 0;
      server.use(
        http.get(columnsUrl, ({ request }) => {
          if (!new URL(request.url).searchParams.get('page_token')) {
            return columnsPage(['a', 'b'], 'next');
          }
          continuations += 1;
          return HttpResponse.json(
            problem(500, 'internal_error', 'engine down'),
            { status: 500 },
          );
        }),
      );

      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            fetch_all: true,
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(continuations).toBe(1);
    });
  });
});
