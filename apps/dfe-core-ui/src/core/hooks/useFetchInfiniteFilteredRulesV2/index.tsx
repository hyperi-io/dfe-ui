import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteRules } from './api';
import { UseFetchInfiniteFilteredRulesProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;
/** The rules-v2 list, a page at a time.
 * @param search - Matched against name, display name, description and severity.
 * @param severity - low, medium, high or critical.
 * @param sort_by - name, display_name, description, severity or created_at.
 * @param sort_order - asc or desc.
 * @param page_size - The number of rules to fetch per page.
 */
export const useFetchInfiniteFilteredRules = ({
  search,
  severity,
  sort_by,
  sort_order,
  page_size,
}: UseFetchInfiniteFilteredRulesProps = {}) => {
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
    queryKey: QUERY_KEYS.rulesV2.default({
      search: debouncedSearch,
      severity,
      sort_by,
      sort_order,
      page_size,
    }),
    queryFn: ({ pageParam, signal }) =>
      fetchInfiniteRules({
        queryParams: {
          search: debouncedSearch || undefined,
          severity,
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
