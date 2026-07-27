import { useQuery } from '@tanstack/react-query';
import { fetchRoleDetail } from './api';

export const ROLE_DETAIL_QUERY_KEY = (role_name?: string | null) => [
  'role',
  ...(role_name ? [role_name] : []),
];
export const useFetchRoleDetail = ({
  role_name,
}: {
  role_name?: string | null;
}) => {
  const isQueryEnabled = !!role_name;
  const { data, isLoading, error } = useQuery({
    queryKey: ROLE_DETAIL_QUERY_KEY(role_name),
    queryFn: () =>
      fetchRoleDetail({
        pathParams: { name: role_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
