import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchEngineStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['engineStatus'],
    queryFn: () => apiClient.get(API_CONFIG.hunts.engineStatus),
  });

  return { data, isLoading, error };
};
