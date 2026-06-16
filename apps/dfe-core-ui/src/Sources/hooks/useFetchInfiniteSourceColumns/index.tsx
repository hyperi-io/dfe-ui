import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { UseFetchInfiniteSourceColumnsProps } from './types.d';

/** useFetchInfiniteSourceColumns props */
/**
 * @param source_name - The name of the source to fetch the columns for.
 * @param version - The version of the source to fetch the columns for.
 * @param per_page - The number of source columns to fetch per page.
 */
/**
 * @returns A list of source columns.
 */
export const useFetchInfiniteSourceColumns = ({
  source_name,
  version,
  per_page = 10,
}: UseFetchInfiniteSourceColumnsProps = {}) => {
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
    queryKey: ['source-columns', source_name, version],
    queryFn: async ({ pageParam = 1, signal }) =>
      apiClient.get(API_CONFIG.sources.sourceColumns, {
        pathParams: { name: source_name ?? '' },
        queryParams: {
          version: version ?? '',
          page: pageParam,
          per_page: per_page ?? 10,
        },
        signal,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.next_page;
      return nextPage != null && nextPage > 0 ? nextPage : undefined;
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
