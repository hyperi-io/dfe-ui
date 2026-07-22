import { useQuery } from '@tanstack/react-query';
import { fetchSystemVersionApi } from './api';

export const SYSTEM_VERSION_QUERY_KEY = () => ['systemVersion'];

export const useFetchSystemVersion = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_VERSION_QUERY_KEY(),
    queryFn: () => fetchSystemVersionApi(),
  });

  return { data, isLoading, error };
};
