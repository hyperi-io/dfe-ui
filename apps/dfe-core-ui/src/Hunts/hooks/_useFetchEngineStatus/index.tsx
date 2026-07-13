import { useQuery } from '@tanstack/react-query';
import { fetchEngineStatus } from './api';

export const useFetchEngineStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['engineStatus'],
    queryFn: () => fetchEngineStatus(),
  });

  return { data, isLoading, error };
};
