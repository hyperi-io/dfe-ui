import { useQuery } from '@tanstack/react-query';
import { fetchServiceSurfaceDetail } from './api';

export const SERVICE_SURFACE_DETAIL_QUERY_KEY = (name?: string | null) => [
  'service-surface',
  ...(name ? [name] : []),
];
export const useFetchServiceSurfaceDetail = ({
  name,
}: {
  name?: string | null;
}) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error } = useQuery({
    queryKey: SERVICE_SURFACE_DETAIL_QUERY_KEY(name),
    queryFn: () =>
      fetchServiceSurfaceDetail({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
