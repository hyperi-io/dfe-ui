import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchClientConfigApi } from './api';

export const useFetchClientConfig = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.clientConfig.default(),
    queryFn: () => fetchClientConfigApi(),
  });

  return { data, isLoading, error };
};
