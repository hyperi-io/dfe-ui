import { QUERY_KEYS } from '@/core/config/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemRetentionApi } from './api';

export const SYSTEM_RETENTION_QUERY_KEY = QUERY_KEYS.system.retention;

export const useFetchRetention = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_RETENTION_QUERY_KEY(),
    queryFn: () => fetchSystemRetentionApi(),
  });

  return { data, isLoading, error };
};
