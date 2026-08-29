import { useQuery } from '@tanstack/react-query';
import { fetchAppDetailApi } from './api';

export const APP_DETAIL_QUERY_KEY = (service: string, instance: string) => [
  'app',
  service,
  instance,
];

export const useFetchAppDetail = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APP_DETAIL_QUERY_KEY(service, instance),
    queryFn: () => fetchAppDetailApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
