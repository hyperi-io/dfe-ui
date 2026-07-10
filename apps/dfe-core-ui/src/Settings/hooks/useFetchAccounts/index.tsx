import { useQuery } from '@tanstack/react-query';
import { fetchAccounts } from './api';

export const useFetchAccounts = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchAccounts(),
  });

  return { data, isLoading, error, refetch };
};
