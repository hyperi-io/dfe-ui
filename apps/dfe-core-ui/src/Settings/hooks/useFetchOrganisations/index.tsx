import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchOrganisations = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => apiClient.get(API_CONFIG.orgs.default),
  });

  return { data, isLoading, error };
};
