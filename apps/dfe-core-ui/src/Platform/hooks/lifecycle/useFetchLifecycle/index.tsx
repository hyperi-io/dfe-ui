import { useQuery } from '@tanstack/react-query';
import { fetchLifecycleApi } from './api';

export const LIFECYCLE_QUERY_KEY = () => ['lifecycle'];

export const useFetchLifecycle = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: LIFECYCLE_QUERY_KEY(),
    queryFn: () => fetchLifecycleApi(),
  });

  return { data, isLoading, error };
};
