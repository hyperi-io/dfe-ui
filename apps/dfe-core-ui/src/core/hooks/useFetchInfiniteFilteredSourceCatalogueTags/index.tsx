import { getNextPageToken } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchInfiniteFilteredSourceCatalogueTags } from './api';
import { UseFetchInfiniteFilteredSourceCatalogueTagsProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

/** useFetchInfiniteFilteredSourceCatalogueTags props */
/**
 * @param name - The name of the source to filter the catalogue tags by.
 * @param page_size - The number of catalogue tags to fetch per page.
 */
/**
 * @returns A list of catalogue tags.
 */

export const useFetchInfiniteFilteredSourceCatalogueTags = ({
  name,
  page_size,
}: UseFetchInfiniteFilteredSourceCatalogueTagsProps = {}) => {
  const debouncedName = useDebounce(name ?? '', SEARCH_DEBOUNCE_MS);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.sources.catalogueTags({
      name: debouncedName,
      page_size,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteFilteredSourceCatalogueTags({
        queryParams: {
          name: debouncedName,
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
