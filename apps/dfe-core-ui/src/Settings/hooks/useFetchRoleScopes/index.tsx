import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchRoleScopes = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['role-scopes'],
    queryFn: () => apiClient.get(API_CONFIG.roles.scopes),
  });

  return { data, isLoading, error };
};
