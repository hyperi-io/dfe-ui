import { $api, asApiError } from '@/core/config/api';
import { getNextPageToken, toOrderBy } from '@/core/config/api/pagination';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useLoadMoreRef } from '@/core/hooks/useLoadMoreRef';
import type { InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  TSourceListResponse,
  UseFetchInfiniteFilteredSourcesProps,
} from './types';

const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_LIST: TSourceListResponse = {
  items: [],
  objects: {},
  total_size: 0,
  next_page_token: null,
};

const flattenSourcePages = (
  data: InfiniteData<TSourceListResponse>,
): TSourceListResponse => ({
  ...data.pages[0]!,
  items: data.pages.flatMap((page) => page.items),
  objects: Object.assign({}, ...data.pages.map((page) => page.objects)),
});

const enabledOf = (status: 'enabled' | 'disabled' | undefined) =>
  status === undefined ? undefined : status === 'enabled';

/** The sources list, a page at a time, filtered by a debounced search, status and sort. */
export const useFetchInfiniteFilteredSources = ({
  search,
  status,
  sort_by,
  sort_order,
  page_size,
}: UseFetchInfiniteFilteredSourcesProps = {}) => {
  const debouncedSearch = useDebounce(search ?? '', SEARCH_DEBOUNCE_MS);
  const query = $api.useInfiniteQuery(
    'get',
    '/api/v1/sources',
    {
      params: {
        query: {
          search: debouncedSearch || undefined,
          enabled: enabledOf(status),
          order_by: toOrderBy(sort_by, sort_order),
          page_size,
        },
      },
    },
    {
      pageParamName: 'page_token',
      getNextPageParam: getNextPageToken,
      initialPageParam: null,
      select: flattenSourcePages,
    },
  );
  const loadMoreRef = useLoadMoreRef({
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  });
  const data = useMemo(() => query.data ?? EMPTY_LIST, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: asApiError(query.error),
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    loadMoreRef,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
