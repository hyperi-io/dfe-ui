import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchHuntDetail } from './api';

export const useFetchHuntDetail = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.hunts.hunt({ name }),
    queryFn: ({ signal }) =>
      fetchHuntDetail({ pathParams: { name: name ?? '' }, signal }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
