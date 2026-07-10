import { useQuery } from '@tanstack/react-query';
import { fetchPermissions } from './api';

export const useFetchPermissions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => fetchPermissions(),
  });

  return { data, isLoading, error };
};
