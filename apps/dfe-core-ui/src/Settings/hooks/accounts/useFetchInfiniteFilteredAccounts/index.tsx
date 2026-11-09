import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchAccounts } from './api';
import { useFetchInfiniteFilteredAccountsProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredAccounts props */
/**
 * @param search - The search query to filter the accounts.
 * @param sort_by - The field to sort the accounts by.
 * @param sort_order - The order to sort the accounts by.
 * @param page_size - The number of accounts to fetch per page.
 */
/**
 * @returns A list of accounts.
 */
export const useFetchInfiniteFilteredAccounts = ({
  search,
  oidc_id,
  blocked,
  include_core,
  sort_by,
  sort_order,
  page_size,
}: useFetchInfiniteFilteredAccountsProps = {}) => {
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
    queryKey: QUERY_KEYS.accounts.default({
      search: debouncedSearch,
      oidc_id,
      include_core,
      blocked,
      sort_by,
      sort_order,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchAccounts({
        queryParams: {
          search: debouncedSearch || undefined,
          blocked,
          oidc_id: oidc_id || undefined,
          include_core: include_core || undefined,
          order_by: toOrderBy(sort_by, sort_order),
          page_token: pageParam,
          page_size,
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
