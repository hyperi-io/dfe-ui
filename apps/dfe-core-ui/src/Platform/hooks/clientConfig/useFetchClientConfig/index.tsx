import { useQuery } from '@tanstack/react-query';
import { fetchClientConfigApi } from './api';

export const CLIENT_CONFIG_QUERY_KEY = () => ['clientConfig'];

export const useFetchClientConfig = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: CLIENT_CONFIG_QUERY_KEY(),
    queryFn: () => fetchClientConfigApi(),
  });

  return { data, isLoading, error };
};
