import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from './api';

export const useFetchCurrentUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.accounts.me(),
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
