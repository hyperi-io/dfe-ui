import { getNextPageToken } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { defaultsDriftSources } from './api';
import { UseFetchInfiniteDefaultsDriftSourcesProps } from './types';

/** useFetchInfiniteDefaultsDriftSources props */
/**
 * @param search - The search query to filter the defaults drift sources.
 * @param page_size - The number of defaults drift sources to fetch per page.
 */
/**
 * @returns A list of defaults drift sources.
 */
export const useFetchInfiniteDefaultsDriftSources = ({
  search,
  page_size = 10,
}: UseFetchInfiniteDefaultsDriftSourcesProps = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.system.defaultsDrift({ search, page_size }),
    queryFn: async ({ pageParam, signal }) =>
      defaultsDriftSources({
        queryParams: { page_token: pageParam, page_size, search },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return {
        items: [],
        total_size: 0,
        next_page_token: null,
      };
    }

    const allItems = data.pages.flatMap((page) => page.items || []);
    return {
      ...data.pages[0],
      items: allItems,
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
