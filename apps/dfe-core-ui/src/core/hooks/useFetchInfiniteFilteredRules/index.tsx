import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { UseFetchInfiniteFilteredRulesProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;
/** useFetchInfiniteFilteredRules
 * @param search - The search query to filter the rules by name and description.
 * @param severity - The severity of the rules to filter by (low, medium, high).
 * @param source - The source of the rules to filter by.
 * @param sort_by - The field to sort the rules by (name, description).
 * @param sort_order - The order to sort the rules by.
 * @param per_page - The number of rules to fetch per page.
 */
export const useFetchInfiniteFilteredRules = ({
  search,
  severity,
  source,
  sort_by,
  sort_order,
  per_page,
}: UseFetchInfiniteFilteredRulesProps = {}) => {
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
    queryKey: [
      'rules',
      debouncedSearch,
      severity,
      sort_by,
      sort_order,
      per_page,
    ],
    queryFn: ({ pageParam = 1, signal }) =>
      apiClient.get(API_CONFIG.rules.default, {
        queryParams: {
          search: debouncedSearch || undefined,
          source,
          severity,
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
