import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { getNextPageToken } from '@/core/config/api/pagination';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchAppHistoryApi } from './api';

/**
 * Every governed change to this instance, newest first, a page at a time.
 *
 * `state` is 'committed' unless an Argo-synced revision is supplied, in which
 * case each commit reads as 'applied' or 'pending' against it.
 */
export const useFetchAppHistory = ({
  service,
  instance,
  pageSize,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  pageSize?: number;
  queryEnabled?: boolean;
}) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.apps.history({ service, instance, pageSize }),
    queryFn: ({ pageParam, signal }) =>
      fetchAppHistoryApi({
        pathParams: { service, instance },
        queryParams: { page_size: pageSize, page_token: pageParam },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  const entries = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return {
    data: entries,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
