import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { UseFetchInfiniteFilteredSchemasProps } from './types';

/** useFetchInfiniteFilteredSchemas props */
/**
 * @param path_prefix - The path prefix to filter the schemas by.
 * @param search - The search query to filter the schemas by path, version and version ids.
 * @param sort_by - The field to sort the schemas by (path, current_version, column_count).
 * @param sort_order - The order to sort the schemas by.
 * @param per_page - The number of schemas to fetch per page.
 */
/**
 * @returns A list of schemas.
 */
export const useFetchInfiniteFilteredSchemas = ({
  search,
  path_prefix,
  sort_by,
  sort_order,
  per_page,
}: UseFetchInfiniteFilteredSchemasProps = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['schemas', search, path_prefix, sort_by, sort_order, per_page],
    queryFn: async ({ pageParam = 1, signal }) =>
      apiClient.get(API_CONFIG.schemas.default, {
        queryParams: {
          search: search,
          path_prefix,
          sort_by,
          sort_order,
          page: pageParam,
          per_page,
        },
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = per_page ?? lastPage.per_page;
      const hasMore =
        lastPage.items && pageSize > 0 && lastPage.items.length >= pageSize;
      return hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return {
        items: [],
        total: 0,
        page: 1,
        per_page: per_page ?? 10,
        total_pages: 0,
        next_page: null as number | null,
        prev_page: null as number | null,
      };
    }

    const allItems = data.pages.flatMap((page) => page.items || []);
    return {
      ...data.pages[0],
      items: allItems,
    };
  }, [data, per_page]);

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
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
