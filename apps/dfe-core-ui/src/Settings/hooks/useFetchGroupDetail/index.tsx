import { useQuery } from '@tanstack/react-query';
import { fetchGroupDetail } from './api';

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
      fetchGroupDetail({
        pathParams: { name: group_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
