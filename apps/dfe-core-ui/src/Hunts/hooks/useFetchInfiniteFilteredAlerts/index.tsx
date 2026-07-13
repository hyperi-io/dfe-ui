import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredAlerts } from './api';
import { UseFetchInfiniteFilteredAlertsProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredAlerts props */
/**
 * @param search - The search query to filter the alerts by name and description.
 * @param hunt - The hunt to filter the alerts by.
 * @param sort_by - The field to sort the alerts by (name, display_name, source_table, target_table).
 * @param sort_order - The order to sort the alerts by.
 * @param per_page - The number of alerts to fetch per page.
 */
/**
 * @returns A list of alerts.
 */
export const useFetchInfiniteFilteredAlerts = ({
  search,
  hunt,
  per_page,
  sort_by,
  sort_order,
}: UseFetchInfiniteFilteredAlertsProps = {}) => {
  const debouncedSearch = useDebounce(search ?? '', SEARCH_DEBOUNCE_MS);

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
    queryKey: ['alerts', debouncedSearch, hunt, sort_by, sort_order, per_page],
    queryFn: async ({ pageParam = 1, signal }) =>
      fetchInfiniteFilteredAlerts({
        queryParams: {
          search: debouncedSearch || undefined,
          hunt: hunt || undefined,
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
