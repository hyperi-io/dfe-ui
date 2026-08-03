import { useQuery } from '@tanstack/react-query';
import { fetchServiceSurfaces } from './api';

export const SERVICE_SURFACES_QUERY_KEY = () => ['service-surfaces'];
export const useFetchServiceSurfaces = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SERVICE_SURFACES_QUERY_KEY(),
    queryFn: () => fetchServiceSurfaces(),
  });

  return { data, isLoading, error };
};
