import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { getNextPageToken } from '@/core/config/api/pagination';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchHuntExecutions } from './api';

/** One hunt's finished fires, newest first, a page at a time. */
export const useFetchHuntExecutions = ({
  name,
  pageSize,
}: {
  name?: string | null;
  pageSize?: number;
}) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.hunts.huntExecutions({ name }),
    queryFn: ({ pageParam, signal }) =>
      fetchHuntExecutions({
        pathParams: { name: name ?? '' },
        queryParams: { page_size: pageSize, page_token: pageParam },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
    enabled: !!name,
  });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return {
    data: items,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
