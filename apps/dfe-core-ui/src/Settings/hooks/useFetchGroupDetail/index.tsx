import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const GROUP_DETAIL_QUERY_KEY = (group_name?: string | null) => [
  'group',
  ...(group_name ? [group_name] : []),
];

export const useFetchGroupDetail = ({
  group_name,
}: {
  group_name?: string | null;
}) => {
  const isQueryEnabled = !!group_name;
  const { data, isLoading, error } = useQuery({
    queryKey: GROUP_DETAIL_QUERY_KEY(group_name),
    queryFn: () =>
      apiClient.get(API_CONFIG.groups.group, {
        pathParams: { name: group_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
