import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchRoleDetail } from './api';

export const useFetchRoleDetail = ({
  role_name,
}: {
  role_name?: string | null;
}) => {
  const isQueryEnabled = !!role_name;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.roles.role({ name: role_name }),
    queryFn: () =>
      fetchRoleDetail({
        pathParams: { name: role_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
