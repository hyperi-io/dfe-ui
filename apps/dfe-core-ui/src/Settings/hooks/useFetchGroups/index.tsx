import { useQuery } from '@tanstack/react-query';
import { fetchGroups } from './api';

export const useFetchGroups = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: () => fetchGroups(),
  });

  return { data, isLoading, error, refetch };
};
