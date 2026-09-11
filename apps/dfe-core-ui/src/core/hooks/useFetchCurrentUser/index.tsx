'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from './api';

export const useFetchCurrentUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });

  return {
    data: data ?? undefined,
    isLoading,
    error,
    isError: error != null,
    refetch: () => fetchCurrentUser(),
  };
};
