import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredSchemas } from './api';
import { UseFetchInfiniteFilteredSchemasProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredSchemas props */
/**
 * @param search - The search query to filter the schemas by path, version and version ids.
 * @param schema_type - The type of the schema to filter by (meta, common-header, etc) string[].
 * @param sort_by - The field to sort the schemas by (path, current_version, column_count).
 * @param sort_order - The order to sort the schemas by.
 * @param page_size - The number of schemas to fetch per page.
 */
/**
 * @returns A list of schemas.
 */
export const useFetchInfiniteFilteredSchemas = ({
  search,
  schema_type,
  sort_by,
  sort_order,
  page_size,
}: UseFetchInfiniteFilteredSchemasProps = {}) => {
  const debouncedSearch = useDebounce(search ?? '', SEARCH_DEBOUNCE_MS);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.schemas.default({
      search: debouncedSearch,
      schema_type,
      sort_by,
      sort_order,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFilteredSchemas({
        queryParams: {
          search: debouncedSearch || undefined,
          schema_type,
          order_by: toOrderBy(sort_by, sort_order),
          page_token: pageParam,
          page_size,
        },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return {
        items: [],
        objects: {},
        total_size: 0,
        next_page_token: null,
      };
    }

    const allItems = data.pages.flatMap((page) => page.items || []);
    const allSchemaObjects = data.pages.reduce((acc, page) => {
      return {
        ...acc,
        ...page.objects,
      };
    }, {});
    return {
      ...data.pages[0],
      items: allItems,
      objects: allSchemaObjects,
    };
  }, [data]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    data: flattenedData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
