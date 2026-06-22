import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

const HUNT_DETAIL_QUERY_KEY = (hunt_id?: string | null) => [
  'huntDetail',
  hunt_id,
];

export const useFetchHuntDetail = ({
  hunt_id,
}: {
  hunt_id?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: HUNT_DETAIL_QUERY_KEY(hunt_id),
    queryFn: ({ signal }) =>
      apiClient.get(API_CONFIG.hunts.hunt, {
        pathParams: { hunt_id: hunt_id ?? '' },
        signal,
      }),
    enabled: !!hunt_id,
  });

  return { data, isLoading, error };
};
