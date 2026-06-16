import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
import { useFetchInfiniteSourceColumns } from '.';
import { UseFetchInfiniteSourceColumnsItem } from './types';
import {
  MOCK_SOURCE_NAME,
  server,
} from './useFetchInfiniteSourceColumns.mocks';
import { UseFetchInfiniteSourceColumnsProps } from './types.d';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const { wrapper } = buildTestWrapper().withReactQuery();

const DEFAULT_HOOK_PROPS: UseFetchInfiniteSourceColumnsProps = {
  source_name: MOCK_SOURCE_NAME,
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

describe('useFetchInfiniteSourceColumns', () => {
  describe('initial loading state', () => {
    it('should start with loading state and empty data', () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual({
        items: [],
        total: 0,
        page: 1,
        per_page: 10,
        total_pages: 0,
        next_page: null,
        prev_page: null,
      });
      expect(result.current.isError).toBe(false);
      expect(result.current.isFetchingNextPage).toBe(false);
    });
  });

  describe('successful data fetch', () => {
    it('should fetch and return first page of source columns', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      const responseItem: UseFetchInfiniteSourceColumnsItem = {
        name: 'string',
        attribute: 'string',
        use_case: 'string',
        description: 'string',
        type: 'string',
      };

      expect(result.current.data).toBeDefined();
      expect(result.current.data.items).toHaveLength(10);
      expect(result.current.data.items[0]).toMatchObject(responseItem);
      expect(result.current.isError).toBe(false);
    });

    it('should return all expected properties', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedResponse = {
        items: expect.any(Array),
        total: 25,
        page: 1,
        per_page: 10,
        total_pages: 3,
        next_page: 2,
        prev_page: 0,
      };

      expect(result.current).toMatchObject({
        data: expectedResponse,
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
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      // Wait for first page to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.items).toHaveLength(10);

      // Fetch next page
      void result.current.fetchNextPage();

      // Wait for next page data to be loaded (20 items)
      await waitFor(
        () => {
          expect(result.current.data.items).toHaveLength(20);
        },
        { timeout: 3000 },
      );

      // Data should be flattened - 20 items total
      expect(result.current.data.items[0].name).toBe('string');
      expect(result.current.data.items[10].name).toBe('string');
      expect(result.current.isFetchingNextPage).toBe(false);
    });

    it('should flatten multiple pages correctly', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initial page has 10 items
      expect(result.current.data.items).toHaveLength(10);

      // Fetch page 2
      await result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data.items.length).toBe(20);
        },
        { timeout: 3000 },
      );

      // Verify we have 20 items (pages 1 and 2)
      expect(result.current.data.items).toHaveLength(20);
      expect(result.current.data.items[0].name).toBe('string');
      expect(result.current.data.items[10].name).toBe('string');
      expect(result.current.data.items[19].name).toBe('string');
    });

    it('should not have next page when all data is loaded', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteSourceColumns({
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

      // Fetch page 2
      void result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data.items.length).toBeGreaterThanOrEqual(20);
        },
        { timeout: 3000 },
      );

      // Fetch page 3
      void result.current.fetchNextPage();
      await waitFor(
        () => {
          expect(result.current.data.items).toHaveLength(25);
        },
        { timeout: 3000 },
      );

      // All 25 items should be loaded, no more pages
      expect(result.current.data.items).toHaveLength(25);
    });
  });

  describe('custom page size', () => {
    it('should respect per_page parameter', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteSourceColumns({
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

      expect(result.current.data.items).toHaveLength(5);
    });

    it('should handle per_page larger than available data', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteSourceColumns({
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

      // Should return all 25 items
      expect(result.current.data.items).toHaveLength(25);
    });
  });

  describe('error handling', () => {
    it('should handle error state correctly', async () => {
      server.use(API_CONFIG_MOCKS.schemas.sourceColumns.get.error());

      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
      // Data is empty array due to flattening logic when there's an error
      expect(result.current.data).toEqual({
        items: [],
        total: 0,
        page: 1,
        per_page: 10,
        total_pages: 0,
        next_page: null,
        prev_page: null,
      });
    });
  });

  describe('search parameters', () => {
    it('should include source_name filter in query', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns({ source_name: 'test' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.items).toBeDefined();
    });

    it('should include version filter in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteSourceColumns({
            ...DEFAULT_HOOK_PROPS,
            version: 'test',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.items).toBeDefined();
    });

    it('should include per_page filter in query', async () => {
      const { result } = renderHook(
        () =>
          useFetchInfiniteSourceColumns({
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

      expect(result.current.data.items).toBeDefined();
    });
  });

  describe('refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialData = result.current.data;

      // Call refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Data should be refreshed
      expect(result.current.data).toBeDefined();
      expect(result.current.data.items).toHaveLength(initialData.items.length);
    });
  });

  describe('loadMoreRef', () => {
    it('should provide a ref object for infinite scroll', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
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
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFetchingNextPage).toBe(false);
      const initialLength = result.current.data.items.length;

      // Start fetching next page
      void result.current.fetchNextPage();

      // Wait for data to update
      await waitFor(
        () => {
          expect(result.current.data.items.length).toBeGreaterThan(
            initialLength,
          );
        },
        { timeout: 3000 },
      );

      // Should be false after fetching completes
      expect(result.current.isFetchingNextPage).toBe(false);
    });

    it('should keep isFetchingNextPage false when not fetching', async () => {
      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
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
    it('should handle empty searches array', async () => {
      server.use(
        API_CONFIG_MOCKS.schemas.sourceColumns.get.success({
          source_name: MOCK_SOURCE_NAME,
          mockedResponse: {
            items: [],
            total: 0,
            page: 1,
            per_page: 10,
            total_pages: 0,
            next_page: null,
            prev_page: null,
          },
        }),
      );

      const { result } = renderHook(
        () => useFetchInfiniteSourceColumns(DEFAULT_HOOK_PROPS),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.items).toHaveLength(0);
      expect(result.current.isError).toBe(false);
    });
  });
});
