import { getNextPageToken } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { sourceColumns } from './api';
import { UseFetchInfiniteSourceColumnsProps } from './types';

/** useFetchInfiniteSourceColumns props */
/**
 * @param source_name - The name of the source to fetch the columns for.
 * @param version - The version of the source to fetch the columns for.
 * @param page_size - The number of source columns to fetch per page.
 */
/**
 * @returns A list of source columns.
 */
export const useFetchInfiniteSourceColumns = ({
  source_name,
  version,
  page_size = 10,
}: UseFetchInfiniteSourceColumnsProps = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.sources.sourceColumns({
      source_name,
      version,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      sourceColumns({
        pathParams: { name: source_name ?? '' },
        queryParams: {
          version: version ?? '',
          page_token: pageParam,
          page_size: page_size ?? 10,
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
