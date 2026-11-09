import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFieldMaps } from './api';
import { UseFetchInfiniteFilteredFieldMapsProps } from './types';

/** useFetchInfiniteFilteredFieldMaps props */
/**
 * @param standard - The standard to filter the field maps by.
 * @param search - The search query to filter the field maps by standard and source names.
 * @param sort_by - The field to sort the field maps by (standard, source, mapping_count).
 * @param sort_order - The order to sort the field maps by.
 * @param page_size - The number of field maps to fetch per page.
 */
/**
 * @returns A list of field maps.
 */
export const useFetchInfiniteFilteredFieldMaps = ({
  search,
  standard,
  sort_by,
  sort_order,
  page_size,
}: UseFetchInfiniteFilteredFieldMapsProps = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.fieldMaps.default({
      search,
      standard,
      sort_by,
      sort_order,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFieldMaps({
        queryParams: {
          search: search,
          standard: standard,
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
