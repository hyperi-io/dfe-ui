import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemVersionApi } from './api';

export const useFetchSystemVersion = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.version(),
    queryFn: () => fetchSystemVersionApi(),
  });

  return { data, isLoading, error };
};
