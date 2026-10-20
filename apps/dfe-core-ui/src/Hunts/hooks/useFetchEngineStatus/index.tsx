import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchEngineStatus } from './api';

export const useFetchEngineStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.hunts.engineStatus(),
    queryFn: () => fetchEngineStatus(),
  });

  return { data, isLoading, error };
};
