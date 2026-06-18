import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchRoleDetail = ({
  role_name,
}: {
  role_name?: string | null;
}) => {
  const isQueryEnabled = !!role_name;
  const { data, isLoading, error } = useQuery({
    queryKey: ['role', role_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.roles.role, {
        pathParams: { name: role_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
