import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemClickhouseStatusApi } from './api';

export const useFetchSystemClickhouseStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.clickhouseCloud(),
    queryFn: () => fetchSystemClickhouseStatusApi(),
  });

  return { data, isLoading, error };
};
