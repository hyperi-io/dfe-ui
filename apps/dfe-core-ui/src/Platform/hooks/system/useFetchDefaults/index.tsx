import { useQuery } from '@tanstack/react-query';
import { fetchSystemDefaultsApi } from './api';

export const SYSTEM_DEFAULTS_QUERY_KEY = () => ['system', 'defaults'];

export const useFetchDefaults = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_DEFAULTS_QUERY_KEY(),
    queryFn: () => fetchSystemDefaultsApi(),
  });

  return { data, isLoading, error };
};
