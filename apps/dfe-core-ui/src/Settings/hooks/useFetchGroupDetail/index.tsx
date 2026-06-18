import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchGroupDetail = ({
  group_name,
}: {
  group_name?: string | null;
}) => {
  const isQueryEnabled = !!group_name;
  const { data, isLoading, error } = useQuery({
    queryKey: ['group', group_name],
    queryFn: () =>
      apiClient.get(API_CONFIG.groups.group, {
        pathParams: { name: group_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
