import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { sourceCatalogues } from './api';
import { UseFetchInfiniteSourceCataloguesProps } from './types';

/** useFetchInfiniteSourceCatalogues props */
/**
 * @param search - The search query to filter the source catalogues by.
 * @param intake - The intake to filter the source catalogues by.
 * @param per_page - The number of source catalogues to fetch per page.
 */
/**
 * @returns A list of source catalogues.
 */
export const useFetchInfiniteSourceCatalogues = ({
  search,
  intake,
  per_page = 10,
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
    queryKey: QUERY_KEYS.sources.catalogue({ search, intake, per_page, page }),
    queryFn: async ({ pageParam = 1, signal }) =>
      sourceCatalogues({
        queryParams: {
          search: search,
          intake: intake,
          per_page: per_page ?? 10,
          page: page ?? pageParam,
        },
        signal,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.next_page;
      return nextPage != null && nextPage > 0 ? nextPage : undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
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
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
