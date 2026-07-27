import { useDebounce } from '@/core/hooks/useDebounce';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchAccounts } from './api';
import { useFetchInfiniteFilteredAccountsProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

export const ACCOUNTS_QUERY_KEY = (
  search?: string,
  sort_by?: 'created_at' | 'updated_at',
  sort_order?: 'asc' | 'desc',
  page?: number,
  per_page?: number,
) => [
  'accounts',
  ...(search ? [search] : []),
  ...(sort_by ? [sort_by] : []),
  ...(sort_order ? [sort_order] : []),
  ...(page ? [page] : []),
  ...(per_page ? [per_page] : []),
];

/** useFetchInfiniteFilteredAccounts props */
/**
 * @param search - The search query to filter the accounts.
 * @param sort_by - The field to sort the accounts by.
 * @param sort_order - The order to sort the accounts by.
 * @param page - The page number to fetch.
 * @param per_page - The number of accounts to fetch per page.
 */
/**
 * @returns A list of accounts.
 */
export const useFetchInfiniteFilteredAccounts = ({
  search,
  sort_by,
  sort_order,
  page,
  per_page,
}: useFetchInfiniteFilteredAccountsProps = {}) => {
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
    queryKey: ACCOUNTS_QUERY_KEY(
      debouncedSearch,
      sort_by,
      sort_order,
      page,
      per_page,
    ),
    queryFn: async ({ pageParam = 1, signal }) =>
      fetchAccounts({
        queryParams: {
          search: debouncedSearch || undefined,
          sort_by: sort_by || undefined,
          sort_order: sort_order || undefined,
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
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
