import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchDefaultDriftSources } from './api';

export const useFetchDefaultDriftSources = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.defaultsDrift(),
    queryFn: () => fetchDefaultDriftSources(),
  });
  return { data, isLoading, error };
};
