import { useQuery } from '@tanstack/react-query';
import { fetchHuntDetail } from './api';

export const HUNT_DETAIL_QUERY_KEY = (name?: string | null) => [
  'huntDetail',
  ...(name ? [name] : []),
];

export const useFetchHuntDetail = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: HUNT_DETAIL_QUERY_KEY(name),
    queryFn: ({ signal }) =>
      fetchHuntDetail({ pathParams: { name: name ?? '' }, signal }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
