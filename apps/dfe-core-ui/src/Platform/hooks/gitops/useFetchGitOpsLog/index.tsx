import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { gitOpsLogApi } from './api';
import {
  TGitOpsLogFlattenedData,
  TGitOpsLogResponse,
  UseFetchGitOpsLogProps,
} from './types';

export const DEFAULT_GIT_OPS_LOG_LIMIT = 50;

export const GIT_OPS_LOG_QUERY_KEY = ({
  limit,
  group_by,
  applied_revision,
}: UseFetchGitOpsLogProps = {}) => [
  'gitOpsLog',
  ...(limit !== undefined ? [limit] : []),
  ...(group_by ? [group_by] : []),
  ...(applied_revision ? [applied_revision] : []),
];

const getGitOpsLogPageEntries = (page: TGitOpsLogResponse) => {
  if ('entries' in page) {
    return page.entries ?? [];
  }
  return page.groups.map((group) => group.latest);
};

export const useFetchGitOpsLog = ({
  limit = DEFAULT_GIT_OPS_LOG_LIMIT,
  group_by,
  applied_revision,
}: UseFetchGitOpsLogProps = {}) => {
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
    queryKey: GIT_OPS_LOG_QUERY_KEY({ limit, group_by, applied_revision }),
    queryFn: async ({ pageParam, signal }) =>
      gitOpsLogApi({
        queryParams: {
          limit,
          before: pageParam,
          group_by: group_by ?? undefined,
          applied_revision: applied_revision ?? undefined,
        },
        signal,
      }),
    getNextPageParam: (lastPage) => {
      if ('next_before' in lastPage && lastPage.next_before) {
        return lastPage.next_before;
      }
      return undefined;
    },
    initialPageParam: undefined as string | undefined,
  });

  const flattenedData = useMemo((): TGitOpsLogFlattenedData => {
    if (!data?.pages?.length) {
      return { entries: [] };
    }

    const entries = data.pages.flatMap(getGitOpsLogPageEntries);
    return { entries };
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
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
