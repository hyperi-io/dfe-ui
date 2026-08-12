import { useQuery } from '@tanstack/react-query';
import { fetchSetupStatus } from './api';

export const useFetchSetupStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['setup-status'],
    queryFn: () => fetchSetupStatus(),
  });
  return { data, isLoading, error };
};
