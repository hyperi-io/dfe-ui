import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchLifecycleApi } from './api';

export const useFetchLifecycle = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.lifecycle.default(),
    queryFn: () => fetchLifecycleApi(),
  });

  return { data, isLoading, error };
};
