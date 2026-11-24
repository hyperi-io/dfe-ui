import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchHuntExecutions } from './api';

export const useFetchHuntExecutions = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.hunts.huntExecutions({ name }),
    queryFn: ({ signal }) =>
      fetchHuntExecutions({ pathParams: { name: name ?? '' }, signal }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
