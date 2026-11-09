import { getNextPageToken } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredRoles } from './api';
import { ResourceType, UseFetchInfiniteFilteredRolesProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredRoles props */
/**
 * @param search - The search query to filter the roles by name and description.
 * @param resource_type - The type of the resource to filter the roles by (organisation, source, schema, service).
 * @param page_size - The number of roles to fetch per page.
 */
/**
 * @returns A list of roles.
 */
export const useFetchInfiniteFilteredRoles = ({
  search,
  resource_type,
  page_size,
}: UseFetchInfiniteFilteredRolesProps = {}) => {
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
    queryKey: QUERY_KEYS.roles.default({
      search: debouncedSearch,
      resource_type: resource_type as ResourceType,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFilteredRoles({
        queryParams: {
          search: debouncedSearch || undefined,
          resource_type: resource_type as ResourceType,
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
