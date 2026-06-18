import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchGroups = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient.get(API_CONFIG.groups.default),
  });

  return { data, isLoading, error, refetch };
};
