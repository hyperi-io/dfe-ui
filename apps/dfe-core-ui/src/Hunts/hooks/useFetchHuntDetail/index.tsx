import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const HUNT_DETAIL_QUERY_KEY = (name?: string | null) => [
  'huntDetail',
  name,
];

export const useFetchHuntDetail = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: HUNT_DETAIL_QUERY_KEY(name),
    queryFn: ({ signal }) =>
      apiClient.get(API_CONFIG.hunts.hunt, {
        pathParams: { name: name ?? '' },
        signal,
      }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
