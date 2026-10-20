import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchPermissions } from './api';

export const useFetchPermissions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.auth.permissions(),
    queryFn: () => fetchPermissions(),
  });

  return { data, isLoading, error };
};
