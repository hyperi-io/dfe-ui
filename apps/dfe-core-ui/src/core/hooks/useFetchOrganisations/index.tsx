import { useQuery } from '@tanstack/react-query';
import { fetchOrganisations } from './api';

export const useFetchOrganisations = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => fetchOrganisations(),
  });

  return { data, isLoading, error, refetch };
};
