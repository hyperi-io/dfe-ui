'use client';

import { useAuthStore } from '@/core/stores/authStore';
import { useEffect } from 'react';

export const useAuthMe = () => {
  const me = useAuthStore((state) => state.me);
  const isLoading = useAuthStore((state) => state.meLoading);
  const error = useAuthStore((state) => state.meError);
  const meLastFetchedAt = useAuthStore((state) => state.meLastFetchedAt);
  const ensureMeLoaded = useAuthStore((state) => state.ensureMeLoaded);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const isPendingInitialLoad =
    me == null && error == null && meLastFetchedAt == null;

  useEffect(() => {
    ensureMeLoaded();
  }, [ensureMeLoaded]);

  return {
    data: me ?? undefined,
    isLoading: isLoading || isPendingInitialLoad,
    error,
    isError: error != null,
    refetch: () => fetchMe({ force: true }),
  };
};
