import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchPermissions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => apiClient.get(API_CONFIG.auth.permissions),
  });

  return { data, isLoading, error };
};
