import { useQuery } from '@tanstack/react-query';
import { fetchSystemClickhouseStatusApi } from './api';

export const SYSTEM_CLICKHOUSE_STATUS_QUERY_KEY = () => [
  'systemClickhouseStatus',
];

export const useFetchSystemClickhouseStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_CLICKHOUSE_STATUS_QUERY_KEY(),
    queryFn: () => fetchSystemClickhouseStatusApi(),
  });

  return { data, isLoading, error };
};
