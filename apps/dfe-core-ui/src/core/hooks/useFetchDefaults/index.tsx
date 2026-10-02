import { useQuery } from '@tanstack/react-query';
import { fetchSystemDefaultsApi, SYSTEM_DEFAULTS_QUERY_KEY } from './api';

export const useFetchDefaults = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_DEFAULTS_QUERY_KEY(),
    queryFn: () => fetchSystemDefaultsApi(),
  });

  return { data, isLoading, error };
};
