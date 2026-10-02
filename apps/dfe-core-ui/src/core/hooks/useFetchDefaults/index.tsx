import { useQuery } from '@tanstack/react-query';
import { fetchSystemDefaultsApi, SYSTEM_DEFAULTS_QUERY_KEY } from './api';

export const useFetchDefaults = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_DEFAULTS_QUERY_KEY(),
    queryFn: () => fetchSystemDefaultsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
