import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemDefaultsApi } from './api';

export const useFetchDefaults = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.defaults(),
    queryFn: () => fetchSystemDefaultsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
