import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredSources } from './api';
import { UseFetchInfiniteFilteredSourcesProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredSources props */
/**
 * @param search - The search query to filter the sources by display name.
 * @param enabled - The status of the sources to filter by (true, false).
 * @param sort_by - The field to sort the sources by (display_name, enabled).
 * @param sort_order - The order to sort the sources by.
 * @param page_size - The number of sources to fetch per page.
 */
/**
 * @returns A list of sources.
 */
const transformStatusToEnabled = (
  status: 'enabled' | 'disabled' | undefined,
) => {
  if (status === 'enabled') return true;
  if (status === 'disabled') return false;
  return undefined;
};
export const useFetchInfiniteFilteredSources = ({
  search,
  status,
  sort_by,
  sort_order,
  page_size,
}: UseFetchInfiniteFilteredSourcesProps = {}) => {
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
    queryKey: QUERY_KEYS.sources.default({
      search: debouncedSearch,
      status,
      sort_by,
      sort_order,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFilteredSources({
        queryParams: {
          search: debouncedSearch || undefined,
          enabled: transformStatusToEnabled(status),
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
        objects: {},
        total_size: 0,
        next_page_token: null,
      };
    }

    const allItems = data.pages.flatMap((page) => page.items || []);
    const allObjects = data.pages.reduce((acc, page) => {
      return {
        ...acc,
        ...page.objects,
      };
    }, {});
    return {
      ...data.pages[0],
      items: allItems,
      objects: allObjects,
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
