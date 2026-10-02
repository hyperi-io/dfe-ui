import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { defaultsDriftSources } from './api';
import { UseFetchInfiniteDefaultsDriftSourcesProps } from './types';

/** useFetchInfiniteDefaultsDriftSources props */
/**
 * @param search - The search query to filter the defaults drift sources.
 * @param page - The page number to fetch.
 * @param per_page - The number of defaults drift sources to fetch per page.
 */
/**
 * @returns A list of defaults drift sources.
 */
export const useFetchInfiniteDefaultsDriftSources = ({
  search,
  per_page = 10,
  page = 1,
}: UseFetchInfiniteDefaultsDriftSourcesProps = {}) => {
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
    queryKey: QUERY_KEYS.system.defaultsDrift({ search, page, per_page }),
    queryFn: async ({ pageParam = 1, signal }) =>
      defaultsDriftSources({
        queryParams: { page: pageParam, per_page, search },
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
