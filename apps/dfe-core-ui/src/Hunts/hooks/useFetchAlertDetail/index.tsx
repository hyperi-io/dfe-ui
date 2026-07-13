import { useQuery } from '@tanstack/react-query';
import { fetchAlertDetail } from './api';

export const useFetchAlertDetail = ({ name }: { name?: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['alert', name],
    queryFn: ({ signal }) =>
      fetchAlertDetail({ pathParams: { name: name ?? '' }, signal }),
    enabled: !!name,
  });

  return { data, isLoading, error };
};
