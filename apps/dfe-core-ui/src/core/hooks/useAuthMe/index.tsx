import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useAuthMe = () => {
  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get(API_CONFIG.auth.me),
  });

  return { data, isLoading, error, refetch, isError };
};
