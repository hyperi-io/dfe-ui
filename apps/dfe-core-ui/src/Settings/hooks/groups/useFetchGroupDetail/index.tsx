import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchGroupDetail } from './api';

export const useFetchGroupDetail = ({
  group_name,
}: {
  group_name?: string | null;
}) => {
  const isQueryEnabled = !!group_name;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.groups.group({ name: group_name }),
    queryFn: () =>
      fetchGroupDetail({
        pathParams: { name: group_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
