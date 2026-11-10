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

  // A commit landing between page loads shifts the next page down, which repeats its first change
  const entries = useMemo(() => {
    const seen = new Set<string>();
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    return items.filter((entry) => {
      if (seen.has(entry.sha)) return false;
      seen.add(entry.sha);
      return true;
    });
  }, [data]);

  return {
    data: entries,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
