import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { components } from '@repo/dfe-engine-types';
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
import { useFetchInfiniteFilteredSchemaDetailColumns } from '.';
import { UseFetchInfiniteFilteredSchemaDetailColumnsProps } from './types';
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

      const responseItem: components['schemas']['dfe_engine__schema__models__SchemaColumn-Output'] =
        {
          name: 'string',
          type: 'string',
          attribute: ['string'],
          use_case: 'string',
          expr: 'string',
        };

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.version.columns.items).toHaveLength(10);
      expect(result.current.data?.version.columns.items[0]).toMatchObject(
        responseItem,
      );
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
          version: {
            columns: {
              items: expect.any(Array),
              total: 25,
              page: 1,
              per_page: 10,
              total_pages: 3,
              next_page: 2,
              prev_page: null,
            },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: expect.any(Function),
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

      expect(result.current.data?.version.columns.items).toHaveLength(10);

      void result.current.fetchNextPage();

      await waitFor(
        () => {
          expect(result.current.data?.version.columns.items).toHaveLength(20);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.version.columns.items[0].name).toBe('string');
      expect(result.current.data?.version.columns.items[10].name).toBe(
        'string',
      );
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

      expect(result.current.data?.version.columns.items).toHaveLength(10);

      await result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data?.version.columns.items.length).toBe(20);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.version.columns.items).toHaveLength(20);
      expect(result.current.data?.version.columns.items[0].name).toBe('string');
      expect(result.current.data?.version.columns.items[10].name).toBe(
        'string',
      );
      expect(result.current.data?.version.columns.items[19].name).toBe(
        'string',
      );
    });

    it('should not have next page when all data is loaded', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            per_page: 10,
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
          expect(
            result.current.data?.version.columns.items.length,
          ).toBeGreaterThanOrEqual(20);
        },
        { timeout: 3000 },
      );

      void result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data?.version.columns.items).toHaveLength(25);
        },
        { timeout: 3000 },
      );

      expect(result.current.data?.version.columns.items).toHaveLength(25);
    });
  });

  describe('custom page size', () => {
    it('should respect per_page parameter', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            per_page: 5,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.version.columns.items).toHaveLength(5);
    });

    it('should handle per_page larger than available data', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteFilteredSchemaDetailColumns({
            ...DEFAULT_HOOK_PROPS,
            per_page: 100,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.version.columns.items).toHaveLength(25);
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

      expect(result.current.data?.version.columns.items).toBeDefined();
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

      expect(result.current.data?.version.columns.items).toBeDefined();
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

      expect(result.current.data?.version.columns.items).toBeDefined();
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

      expect(result.current.data?.version.columns.items).toBeDefined();
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
            per_page: 20,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.version.columns.items).toBeDefined();
    });
  });

  describe('refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteFilteredSchemaDetailColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialData = result.current.data;

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.version.columns.items).toHaveLength(
        initialData?.version.columns.items?.length ?? 0,
      );
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
      const initialLength =
        result.current.data?.version.columns.items?.length ?? 0;

      void result.current.fetchNextPage();

      await waitFor(
        () => {
          expect(
            result.current.data?.version.columns.items?.length ?? 0,
          ).toBeGreaterThan(initialLength);
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
            current: '1.0.0',
            selected: '1.0.0',
            versions: ['1.0.0'],
            version: {
              date: 'string',
              type: 'string',
              summary: 'string',
              columns: {
                items: [],
                total: 0,
                page: 0,
                per_page: 0,
                total_pages: 0,
                next_page: null,
                prev_page: null,
              },
            },
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

      expect(result.current.data?.version.columns.items).toHaveLength(0);
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
        expect(result.current.data?.version.columns.items).toBeDefined();
      });
    });
  });
});
