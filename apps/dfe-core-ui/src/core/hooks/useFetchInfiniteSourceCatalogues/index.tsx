import { getNextPageToken } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { sourceCatalogues } from './api';
import { UseFetchInfiniteSourceCataloguesProps } from './types';

/** useFetchInfiniteSourceCatalogues props */
/**
 * @param search - The search query to filter the source catalogues by.
 * @param intake - The intake to filter the source catalogues by.
 * @param page_size - The number of source catalogues to fetch per page.
 * @param page - The one-based page to open at, read as `skip` on the first request.
 */
/**
 * @returns A list of source catalogues.
 */
export const useFetchInfiniteSourceCatalogues = ({
  search,
  intake,
  tags,
  engine,
  include_stored,
  page_size = 10,
  // Allow page control from the caller
  page,
}: UseFetchInfiniteSourceCataloguesProps = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.sources.catalogue({
      search,
      intake,
      tags,
      engine,
      include_stored,
      page_size,
      page,
    }),
    queryFn: async ({ pageParam, signal }) =>
      sourceCatalogues({
        queryParams: {
          search: search,
          intake: intake,
          tags: tags,
          engine,
          include_stored,
          page_size: page_size ?? 10,
          page_token: pageParam,
          skip: page && !pageParam ? (page - 1) * page_size : undefined,
        },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
    placeholderData: keepPreviousData,
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
