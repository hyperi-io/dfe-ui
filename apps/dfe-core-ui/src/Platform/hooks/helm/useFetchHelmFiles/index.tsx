import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchHelmFilesApi } from './api';

export const useFetchHelmFiles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.helm.listFiles(),
    queryFn: () => fetchHelmFilesApi(),
  });

  return { data, isLoading, error };
};
