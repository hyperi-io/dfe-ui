import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchAccounts = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiClient.get(API_CONFIG.accounts.default),
  });

  return { data, isLoading, error, refetch };
};
