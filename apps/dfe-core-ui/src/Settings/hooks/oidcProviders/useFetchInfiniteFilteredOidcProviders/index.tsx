import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredOidcProvidersApi } from './api';
import { UseFetchInfiniteFilteredOidcProvidersProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;
/** useFetchInfiniteFilteredOidcProviders props */
/**
 * @param search - The search query to filter the oidc providers by name and description.
 * @param sort_by - The field to sort the oidc providers by.
 * @param sort_order - The order to sort the oidc providers by.
 * @param page_size - The number of oidc providers to fetch per page.
 * @param enabled - Whether to fetch at all, for a caller whose user may not read providers.
 */
/**
 * @returns A list of oidc providers.
 */
export const useFetchInfiniteFilteredOidcProviders = ({
  search,
  sort_by,
  sort_order,
  page_size,
  enabled = true,
}: UseFetchInfiniteFilteredOidcProvidersProps = {}) => {
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
    queryKey: QUERY_KEYS.oidcProviders.default({
      search: debouncedSearch || undefined,
      sort_by: sort_by as 'name' | 'type' | 'created_at',
      sort_order: sort_order as 'asc' | 'desc',
      page_size,
    }),

    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFilteredOidcProvidersApi({
        queryParams: {
          search: debouncedSearch || undefined,
          order_by: toOrderBy(sort_by, sort_order),
          page_token: pageParam,
          page_size,
        },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
    enabled,
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
